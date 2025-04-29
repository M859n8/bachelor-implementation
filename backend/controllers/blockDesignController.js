import userModel from '../models/user.js';
import roundTemplates from '../assets/roundTemplates.js';


const blockDesignController = {


    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {roundBlocks}= req.body;
        const user_id = req.user.id;
        if (!user_id || !roundBlocks ) {

            return res.status(400).json({ error: "Missing required fields" });
        }


        // console.log("blocks");
		// console.log(JSON.stringify(roundBlocks, null, 2));

        // console.log("additional data", additionalData);
		const resultsPerRound = await blockDesignController.calculateResults(roundBlocks)

		//send to backend by rounds 
		// console.log(JSON.stringify(resultsPerRound, null, 2));
		const finalScoreText = resultsPerRound.map(r => 
			`Round ${r.round}: ${r.totalScore}%`
		).join(', ');

		let allRoundsScore = 0;
		resultsPerRound.forEach((round) => {
			allRoundsScore += round.totalScore / 3; 
		})

		const finalScore = (
			(resultsPerRound[0].totalScore * 8 + resultsPerRound[1].totalScore * 9 + resultsPerRound[2].totalScore * 10) / 
			(8 + 9 + 10)
		 ) ;

		console.log('final score', finalScore)

		try {
			console.log(`User ${user_id} final score: ${finalScore}%`);
			await userModel.saveToDatabase(user_id, "assemblingObjects", finalScore)

			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore}`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}

        // res.json({ message: "Response saved locally", finalScore: `${finalScore}`  });

    },

    calculateResults: async (submittedRounds) => {
	
		const results = submittedRounds.map((roundData) => {
			const template = roundTemplates.find(t => t.round === roundData.round);
			if (!template) {
				return { round: roundData.round, error: 'Template not found' };
			}

			// 1. Порахувати помилки
			const gridSize = template.gridSize * template.gridSize;
			const errorsCount = blockDesignController.checkBlocksPosition(roundData, template);
			const accuracyPercent = Math.max(0, 100 * (gridSize - errorsCount) / gridSize);

			console.log('Accuracy ', errorsCount, 'and ', accuracyPercent)

			// 2. Порахувати час і швидкість
			const duration = (roundData.endTime - roundData.startTime) / 1000; // в секундах
			const maxAllowed = template.duration; // наприклад, 60, 120, 180
			// const speedPercent = Math.min(100, 100 * (maxAllowed - duration) / maxAllowed);
			const speedPercent = duration > maxAllowed 
			? 0 
			: ((maxAllowed - duration) / maxAllowed) * 100;

			console.log('Time ' , maxAllowed, 'and ', speedPercent)


			// 3. Кількість дій
			// const actionsCount = roundData.blocks.reduce((total, block) => {
			// 	return total 
			// 		+ (block.position?.length || 0) 
			// 		+ (block.color?.length || 0) 
			// 		+ (block.rotation?.length || 0);
			// }, 0);

			const actionsCount = roundData.blocks.reduce((total, block) => {
				return total += block.changesCount;
			}, 0);

			const expectedActions = template.expectedActions; // число з шаблону
			const maxActions = template.maxActions; // число з шаблону


			const efficiencyPercent = actionsCount <= expectedActions
			? 100
			: actionsCount <= maxActions
				? 100 * ((maxActions - actionsCount) / expectedActions)
				: 0;


			// const efficiencyPercent = Math.min(100, 100 * expectedActions / actionsCount);
			console.log('ActionsCount', actionsCount, 'and ', efficiencyPercent)

			// 4. Загальна оцінка як середнє (або з вагою — якщо треба)
			// const totalScore = ((accuracyPercent + speedPercent + efficiencyPercent) / 3).toFixed(1);

			const totalScore = (!accuracyPercent || !speedPercent || !efficiencyPercent)
			? 0
			: (accuracyPercent * 0.5 + speedPercent * 0.3 + efficiencyPercent * 0.2).toFixed(1);


			return {
				round: roundData.round,
				totalScore: parseFloat(totalScore)
			};
		});
	
		console.log('Results:', results);
		// console.log(JSON.stringify(results, null, 2));

		return results;
	},

	checkBlocksPosition: (roundData, template)=>{
		const userBlocks = roundData.blocks;
		let errorsCount =0;

		template.correctBlocks.forEach(correctBlock => {
			const { row, col, color: correctColor, rotation: correctRotation } = correctBlock;

			const userBlock = userBlocks.find(b => 
				b.position.row === row && b.position.col === col
			);
			
			if (!userBlock) {
				console.log('error pos', row, col);
				errorsCount += 1;
				return;
			}

			const userColor = userBlock.color;
			const userRotation = userBlock.rotation;

			const isRotationValid = (() => {
			
				if (correctColor === 'mixed') {
					return userRotation === correctRotation;
				}
			
				if (correctColor === 'white' || correctColor === 'red') {
					return userRotation % 90 === 0;
				}
			
				// На всяк випадок — якщо колір неочікуваний
				return false;
			})();
			
			if (userColor !== correctColor || !isRotationValid) {
				// console.log('error color', row, col)

				errorsCount += 1;
			}
			// if (userColor !== correctColor ) {
			// 	console.log('error color', userColor , correctColor)

			// 	errorsCount += 1;
			// }else if ( !isRotationValid) {
			// 	console.log('error rotation', userRotation, correctRotation)

			// 	errorsCount += 1;
			// }
		});
		console.log(errorsCount);
		return errorsCount;
	

	}, 
	
	// sendToDataBase: () => {

	// },
	

}
export default blockDesignController;

import userModel from '../models/user.js';
import roundTemplates from '../assets/roundTemplates.js';

const blockDesignController = {
    saveResponse: async (req, res) => {
        const {roundBlocks}= req.body;
        const user_id = req.user.id;

        if (!user_id || !roundBlocks ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

		//get results for each round
		const resultsPerRound = await blockDesignController.calculateResults(roundBlocks);
		//calculate final score with weights for each round
		const finalScore = (
			(resultsPerRound[0].totalScore * 8 + resultsPerRound[1].totalScore * 9 + resultsPerRound[2].totalScore * 10) / 
			(8 + 9 + 10)
		 ) ;


		try {
			//save to db
			await userModel.saveToDatabase(user_id, "assemblingObjects", finalScore)
			//send to user
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore}`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
    },

	//calculate accuracy, speed and efficiency percent
    calculateResults: async (submittedRounds) => {
	
		const results = submittedRounds.map((roundData) => {
			const template = roundTemplates.find(t => t.round === roundData.round);
			if (!template) {
				return { round: roundData.round, error: 'Template not found' };
			}

		//--- accuracy percent ---
			const gridSize = template.gridSize * template.gridSize;
			const errorsCount = blockDesignController.checkBlocksPosition(roundData, template);
			//compare error objects to all objects
			const accuracyPercent = Math.max(0, 100 * (gridSize - errorsCount) / gridSize);


		//--- calculate speed percent ---
			const duration = (roundData.endTime - roundData.startTime) / 1000; //in seconds
			const maxAllowed = template.duration;
			//compare speed to reference speed
			const speedPercent = duration > maxAllowed 
			? 0 
			: ((maxAllowed - duration) / maxAllowed) * 100;



		//--- calculate efficiency percent -- actions count ---
			const actionsCount = roundData.blocks.reduce((total, block) => {
				return total += block.changesCount;
			}, 0);
			// compare action count to reference count
			const expectedActions = template.expectedActions; 

			const efficiencyPercent = actionsCount <= expectedActions
			? 100
			: 100 * (expectedActions / actionsCount);



		//--- total score ---
			//calculate total score with defined weights
			const totalScore = (!accuracyPercent || !speedPercent || !efficiencyPercent)
			? 0
			: (accuracyPercent * 0.5 + speedPercent * 0.3 + efficiencyPercent * 0.2).toFixed(1);


			return {
				round: roundData.round,
				totalScore: parseFloat(totalScore)
			};
		});

		return results;
	},

	//check if the block is in the correct position
	checkBlocksPosition: (roundData, template)=>{
		const userBlocks = roundData.blocks;
		let errorsCount =0;
		//get pos from template
		template.correctBlocks.forEach(correctBlock => {
			const { row, col, color: correctColor, rotation: correctRotation } = correctBlock;
			//check row and col
			const userBlock = userBlocks.find(b => 
				b.position.row === row && b.position.col === col
			);
			//error if position is empty
			if (!userBlock) {
				errorsCount += 1;
				return;
			}
			//check color and rotation
			const userColor = userBlock.color;
			const userRotation = userBlock.rotation;

			const isRotationValid = (() => {
				//rotation is important only for mixed colors
				if (correctColor === 'mixed') { 
					return userRotation === correctRotation;
				}
				//for red and white colors rotation must be %90
				if (correctColor === 'white' || correctColor === 'red') { 
					return userRotation % 90 === 0;
				}
				return false;
			})();
			
			if (userColor !== correctColor || !isRotationValid) {
				errorsCount += 1;
			}
		
		});
		return errorsCount;
	}, 
	


}
export default blockDesignController;

const roundTemplates = [
    {
        round: 0,
        duration: 60, // у секундах (1 хв)
        gridSize: 3, // 3x3
		expectedActions: 10,
        correctBlocks: [
            { row: 0, col: 0, color: 'red', rotation: 0 },
            { row: 0, col: 1, color: 'white', rotation: 0 },
            { row: 0, col: 2, color: 'white', rotation: 0 },
			{ row: 1, col: 0, color: 'red', rotation: 0 },
            { row: 1, col: 1, color: 'white', rotation: 0 },
            { row: 1, col: 2, color: 'white', rotation: 0 },
			{ row: 2, col: 0, color: 'red', rotation: 0 },
            { row: 2, col: 1, color: 'white', rotation: 0 },
            { row: 2, col: 2, color: 'white', rotation: 0 },
            // і т.д. для всіх 9 або скільки там блоків
        ]
    },
    {
        round: 1,
        duration: 120, // 2 хв
        gridSize: 4,
		expectedActions: 20,

        correctBlocks: [
            { row: 0, col: 0, color: 'red', rotation: 0 },
            { row: 0, col: 1, color: 'blue', rotation: 45 },
            { row: 0, col: 2, color: 'yellow', rotation: 90 },
			{ row: 1, col: 0, color: 'red', rotation: 0 },
            { row: 1, col: 1, color: 'blue', rotation: 45 },
            { row: 1, col: 2, color: 'yellow', rotation: 90 },
			{ row: 2, col: 0, color: 'red', rotation: 0 },
            { row: 2, col: 1, color: 'blue', rotation: 45 },
            { row: 2, col: 2, color: 'yellow', rotation: 90 },
            // і далі...
        ]
    },
    {
        round: 2,
        duration: 180, // 3 хв
        gridSize: 4,
		expectedActions: 20,

        correctBlocks: [
            { row: 0, col: 0, color: 'red', rotation: 0 },
            { row: 0, col: 1, color: 'blue', rotation: 45 },
            { row: 0, col: 2, color: 'yellow', rotation: 90 },
			{ row: 1, col: 0, color: 'red', rotation: 0 },
            { row: 1, col: 1, color: 'blue', rotation: 45 },
            { row: 1, col: 2, color: 'yellow', rotation: 90 },
			{ row: 2, col: 0, color: 'red', rotation: 0 },
            { row: 2, col: 1, color: 'blue', rotation: 45 },
            { row: 2, col: 2, color: 'yellow', rotation: 90 },
        ]
    }
];


const blockDesignController = {


    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {roundBlocks, additionalData}= req.body;
        const user_id = req.user.id;
        if (!user_id || !roundBlocks || !additionalData) {

            return res.status(400).json({ error: "Missing required fields" });
        }


        console.log("blocks");
		console.log(JSON.stringify(roundBlocks, null, 2));

        // console.log("additional data", additionalData);
		blockDesignController.calculateResults(roundBlocks)

        res.json({ message: "Response saved locally" });

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

			console.log(errorsCount, 'and ', accuracyPercent)

			// 2. Порахувати час і швидкість
			const duration = (roundData.endTime - roundData.startTime) / 1000; // в секундах
			const maxAllowed = template.duration; // наприклад, 60, 120, 180
			const speedPercent = Math.min(100, 100 * (maxAllowed - duration) / maxAllowed);
			console.log(maxAllowed, 'and ', speedPercent)


			// 3. Кількість дій
			const actionsCount = roundData.blocks.reduce((total, block) => {
				return total 
					+ (block.position?.length || 0) 
					+ (block.color?.length || 0) 
					+ (block.rotation?.length || 0);
			}, 0);

			const expectedActions = template.expectedActions; // число з шаблону
			const efficiencyPercent = Math.min(100, 100 * expectedActions / actionsCount);
			console.log(actionsCount, 'and ', efficiencyPercent)

			// 4. Загальна оцінка як середнє (або з вагою — якщо треба)
			const totalScore = ((accuracyPercent + speedPercent + efficiencyPercent) / 3).toFixed(1);


			
			return {
				round: roundData.round,
				totalScore: parseFloat(totalScore)
			};
		});
	
		// console.log('Results:', results);
		console.log(JSON.stringify(results, null, 2));

		return results;
	},

	checkBlocksPosition: (roundData, template)=>{

		

		const userBlocks = roundData.blocks;
		let errorsCount =0;

		template.correctBlocks.forEach(correctBlock => {
			const { row, col, color: correctColor, rotation: correctRotation } = correctBlock;

			const userBlock = userBlocks.find(b => 
				b.position?.some(pos => pos.row === row && pos.col === col)
			);

			if (!userBlock) {
				errorsCount+=1;
				return;
			}

			const userColor = userBlock.color?.at(-1);
			const userRotation = userBlock.rotation?.at(-1);

			if (userColor !== correctColor || userRotation !== correctRotation) {
				errorsCount+=1;

			}
		});
		console.log(errorsCount);
		return errorsCount;
	

	}
	

}
export default blockDesignController;

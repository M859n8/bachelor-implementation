const roundTemplates = [
    {
        round: 0, //template 11
        duration: 210, // у секундах 
        gridSize: 3, // 3x3
		expectedActions: 9,

        correctBlocks: [
            { row: 0, col: 0, color: 'mixed', rotation: 180 },
            { row: 0, col: 1, color: 'red', rotation: 0 },
            { row: 0, col: 2, color: 'mixed', rotation: 270 },
			{ row: 1, col: 0, color: 'red', rotation: 0 },
            { row: 1, col: 1, color: 'mixed', rotation: 90 },
            { row: 1, col: 2, color: 'red', rotation: 0 },
			{ row: 2, col: 0, color: 'mixed', rotation: 0 },
            { row: 2, col: 1, color: 'white', rotation: 0 },
            { row: 2, col: 2, color: 'mixed', rotation: 0 },
            // і т.д. для всіх 9 або скільки там блоків
        ]
    },
    {
        round: 1,
        duration: 120, // 2 хв
        gridSize: 4,
		expectedActions: 17,

        correctBlocks: [
            { row: 0, col: 0, color: 'red', rotation: 0 },
            { row: 0, col: 1, color: 'mixed', rotation: 90 },
            { row: 0, col: 2, color: 'mixed', rotation: 0 },
            { row: 0, col: 3, color: 'red', rotation: 0 },

			{ row: 1, col: 0, color: 'mixed', rotation: 90 },
            { row: 1, col: 1, color: 'mixed', rotation: 270 },
            { row: 1, col: 2, color: 'mixed', rotation: 180 },
			{ row: 1, col: 3, color: 'mixed', rotation: 0 },

			{ row: 2, col: 0, color: 'mixed', rotation: 180 },
            { row: 2, col: 1, color: 'mixed', rotation: 0 },
            { row: 2, col: 2, color: 'mixed', rotation: 90 },
            { row: 2, col: 3, color: 'mixed', rotation: 270 },

			{ row: 3, col: 0, color: 'red', rotation: 0 },
            { row: 3, col: 1, color: 'mixed', rotation: 180 },
            { row: 3, col: 2, color: 'mixed', rotation: 270 },
            { row: 3, col: 3, color: 'red', rotation: 0 },

        ]
    },
    {
        round: 2,
        duration: 180, // 3 хв
        gridSize: 4,
		expectedActions: 17,

        correctBlocks: [
			{ row: 0, col: 0, color: 'mixed', rotation: 180 },
            { row: 0, col: 1, color: 'mixed', rotation: 180 },
            { row: 0, col: 2, color: 'mixed', rotation: 270 },
            { row: 0, col: 3, color: 'white', rotation: 0 },

			{ row: 1, col: 0, color: 'red', rotation: 0 },
            { row: 1, col: 1, color: 'mixed', rotation: 0 },
            { row: 1, col: 2, color: 'mixed', rotation: 0 },
			{ row: 1, col: 3, color: 'mixed', rotation: 180 },

			{ row: 2, col: 0, color: 'mixed', rotation: 0 },
            { row: 2, col: 1, color: 'mixed', rotation: 180 },
            { row: 2, col: 2, color: 'red', rotation: 0 },
            { row: 2, col: 3, color: 'mixed', rotation: 0 },

			{ row: 3, col: 0, color: 'mixed', rotation: 90 },
            { row: 3, col: 1, color: 'mixed', rotation: 0 },
            { row: 3, col: 2, color: 'mixed', rotation: 90 },
            { row: 3, col: 3, color: 'white', rotation: 0 },
        ]
    }
];

export default roundTemplates;
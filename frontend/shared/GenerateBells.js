import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

// Константи для об'єктів
// const TARGET_COUNT = 35; // Кількість дзвіночків
// const TOTAL_OBJECTS = 315; // Загальна кількість об'єктів (дзвіночки + інші)

// Функція для генерації об'єктів
const generateObjects = () => {
    const { width, height } = Dimensions.get("window");
    const GRID_COLUMNS = Math.floor(width/65);
    const GRID_ROWS = Math.floor(height / 65);
    const CELL_WIDTH = width / GRID_COLUMNS;
    const CELL_HEIGHT = height / GRID_ROWS;

    const TOTAL_OBJECTS = GRID_ROWS*GRID_COLUMNS;
    const TARGET_COUNT = Math.floor(TOTAL_OBJECTS / 10);


    let objects = [];
    let takenPositions = new Set();

    let i = 0; 
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLUMNS; col++) {
            let x, y;
            do {
                // col = Math.floor(Math.random() * GRID_COLUMNS);
                // row = Math.floor(Math.random() * GRID_ROWS);
                x = col * CELL_WIDTH + Math.random() * (CELL_WIDTH * 0.6) + CELL_WIDTH * 0.2; // Рандомний зсув
                y = row * CELL_HEIGHT + Math.random() * (CELL_HEIGHT * 0.6) + CELL_HEIGHT * 0.2;
            
            } while (takenPositions.has(`${x}-${y}`));

            takenPositions.add(`${x}-${y}`);

            // categoryIndex = (categoryIndex + 1) % 15;
            const categoryIndex = Math.floor(Math.random() * 15);

            objects.push({
                id: i,
                x,
                y,
                type: categoryIndex,
            });
            i++;
        }
    }

    return objects;
};


// Хук для управління станом об'єктів
const useTestObjects = () => {
    const [objects, setObjects] = useState(generateObjects());

    useEffect(() => {
        const updateDimensions = () => {
            setObjects(generateObjects());
        };

        const subscription = Dimensions.addEventListener("change", updateDimensions);
        return () => subscription?.remove();
    }, []);

    return objects;
};

export default useTestObjects;

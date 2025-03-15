import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

// Константи для об'єктів
const TARGET_COUNT = 35; // Кількість дзвіночків
const TOTAL_OBJECTS = 315; // Загальна кількість об'єктів (дзвіночки + інші)

// Функція для генерації об'єктів
const generateObjects = () => {
    const { width, height } = Dimensions.get("window");
    const GRID_COLUMNS = Math.floor(width / 50); // Кількість стовпців у сітці (50px - приблизний розмір об'єкта)
    const GRID_ROWS = Math.floor(height / 50); // Кількість рядків у сітці
    const CELL_WIDTH = width / GRID_COLUMNS;
    const CELL_HEIGHT = height / GRID_ROWS;

    let objects = [];
    let takenPositions = new Set();

    for (let i = 0; i < TOTAL_OBJECTS; i++) {
        let x, y;
        do {
            const col = Math.floor(Math.random() * GRID_COLUMNS);
            const row = Math.floor(Math.random() * GRID_ROWS);
            x = col * CELL_WIDTH;
            y = row * CELL_HEIGHT;
        } while (takenPositions.has(`${x}-${y}`));

        takenPositions.add(`${x}-${y}`);

        objects.push({
            id: i,
            x,
            y,
            type: i < TARGET_COUNT ? "bell" : "distractor", // Перші 35 об'єктів - дзвіночки
        });
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

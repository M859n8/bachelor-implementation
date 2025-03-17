import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

// Константи для об'єктів
// const TARGET_COUNT = 35; // Кількість дзвіночків
// const TOTAL_OBJECTS = 315; // Загальна кількість об'єктів (дзвіночки + інші)



// Функція для генерації об'єктів
const generateObjects = () => {
    // const { width, height } = Dimensions.get("window");
    const GAME_WIDTH = Dimensions.get("window").width * 0.90; // 90% екрану
    const GAME_HEIGHT = Dimensions.get("window").height * 0.75; // 75% екрану

    const CELL_WIDTH = 65;
    const CELL_HEIGHT = 65;

    const GRID_COLUMNS = Math.floor(GAME_WIDTH / CELL_WIDTH);
    const GRID_ROWS = Math.floor(GAME_HEIGHT / CELL_HEIGHT);
    // const CELL_WIDTH = GAME_WIDTH / GRID_COLUMNS;
    // const CELL_HEIGHT = GAME_HEIGHT / GRID_ROWS;

    

    const TOTAL_OBJECTS = GRID_ROWS*GRID_COLUMNS;
    const TARGET_COUNT = Math.floor(TOTAL_OBJECTS / 10);


    let objects = [];
    // const [objects, setObjects] = useState([]);
    let takenPositions = new Set();

    let i = 0; 
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLUMNS; col++) {
            let x, y;
            do {
                // col = Math.floor(Math.random() * GRID_COLUMNS);
                // row = Math.floor(Math.random() * GRID_ROWS);
                x = col * CELL_WIDTH + Math.random() * (CELL_WIDTH * 0.7) + CELL_WIDTH * 0.01; // Рандомний зсув
                y = row * CELL_HEIGHT + Math.random() * (CELL_HEIGHT * 0.7) + CELL_HEIGHT * 0.01;
            
            } while (takenPositions.has(`${x}-${y}`));

            takenPositions.add(`${x}-${y}`);

            // categoryIndex = (categoryIndex + 1) % 15;
            const categoryIndex = Math.floor(Math.random() * 15);

            objects.push({
                id: i,
                x,
                y,
                type: categoryIndex,
                touched: false,
            });
            // const newObject = {
            //     id: i,
            //     x,
            //     y,
            //     type: categoryIndex,
            //     touched: false,
            // }

            // setObjects((prevObjects) => [...prevObjects, ])
            i++;
        }
    }

    return objects;
};

// export default generateObjects;

// Хук для управління станом об'єктів
//якщо не використовувати цю функцію, а лише першу то розташування об'єктів змінюватиметься з кожним 
//рендерингом (якщо точніше -- кліком дзвіночка)
const useTestObjects = () => {
    const [objects, setObjects] = useState(generateObjects());

    useEffect(() => {
        const updateDimensions = () => { //updating objects coords if dimensions changing
            setObjects(generateObjects());
        };

        //Додає обробник події, який викликає updateDimensions, якщо змінюються розміри екрану.
        const subscription = Dimensions.addEventListener("change", updateDimensions); 
        return () => subscription?.remove(); //Очищення обробника подій при розмонтуванні компонента
                                               // Це запобігає витоку пам'яті.
    }, []);

    return objects;
};

export default useTestObjects;

import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

//generates objects with coordinates for bells cancellation test
const generateObjects = () => {

    const GAME_WIDTH = Dimensions.get("window").width * 0.90; // 90% (defined in styles)
    const GAME_HEIGHT = Dimensions.get("window").height * 0.75; // 75% 

    const CELL_WIDTH = 52; //to accomodate an object of size 40
    const CELL_HEIGHT = 52;

    const GRID_COLUMNS = Math.floor(GAME_WIDTH / CELL_WIDTH);
    const GRID_ROWS = Math.floor(GAME_HEIGHT / CELL_HEIGHT);

    const TOTAL_OBJECTS = GRID_ROWS*GRID_COLUMNS;
    const TARGET_COUNT = Math.floor(TOTAL_OBJECTS / 10);


    let objects = []; //array to save generated ojects
    let takenPositions = new Set(); //set to save generated positions

    let i = 0; 
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLUMNS; col++) {
            let x, y;
            do {
				//gerate coords for this zone but with random shift
                x = col * CELL_WIDTH + Math.random() * (CELL_WIDTH * 0.7) + CELL_WIDTH * 0.01; 
                y = row * CELL_HEIGHT + Math.random() * (CELL_HEIGHT * 0.7) + CELL_HEIGHT * 0.01;
            
            } while (takenPositions.has(`${x}-${y}`)); //check if this position is not taken
			if(x > GAME_WIDTH-30 || y> GAME_HEIGHT-40){
				//check if images are not outside of the field
				continue
			}
            takenPositions.add(`${x}-${y}`);
			//randomly select a category index
            const categoryIndex = Math.floor(Math.random() * 14);
			//create a new object
            objects.push({
                id: i,
                x,
                y,
                type: categoryIndex,
                touched: false,
                time: 0
            });
           
            i++;
        }
    }

    return objects;
};

export default generateObjects;
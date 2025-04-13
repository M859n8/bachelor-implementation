import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button,  TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import {useSharedValue, useAnimatedRef} from 'react-native-reanimated';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Block from '../../shared/Block.js';
import Grid from '../../shared/Grid.js';


export default function BlockDesign() {
	const [backgroundZoomed, setBackgroundZoomed] = useState(false);
	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); // Перемикання стану для збільшення
	};
	const [blocks, setBlocks] = useState([
		{ id: 0, row: 0, col: 0, color: 'white', rotation: 0},
		{ id: 1, row: 0, col: 0, color: 'white', rotation: 0},
		{ id: 2, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 3, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 4, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 5, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 6, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 7, row: 0, col: 0, color: 'white', rotation: 0 },
		{ id: 8, row: 0, col: 0, color: 'white', rotation: 0 },
	]);
	const gridLayout = useSharedValue({ x: 0, y: 0 });
	const blockRefs= useRef([]); // пустий масив refs
	const [sendingData, setSendingData] = useState(false);

	const updateBlockValue = (newValue, type, blockId) => {
		setBlocks((prevBlocks) => {
			const updatedBlock = {
				...prevBlocks[blockId],
				[type]: newValue,
			};
			return [
				...prevBlocks.slice(0, blockId),
				updatedBlock,
				...prevBlocks.slice(blockId + 1)
			];
		});
		console.log('updated');
	};

	// const blockLayout = useSharedValue([{ x: 0, y: 0 }, { x: 0, y: 0 } , { x: 0, y: 0 }, { x: 0, y: 0 } ,]);
	const checkBlocks = () => {
		// Отримати координати сітки
		// gridRef.current?.measure((gx, gy, gWidth, gHeight, gPageX, gPageY) => {
		// 	const grid = {
		// 		x: gPageX,
		// 		y: gPageY,
		// 		width: gWidth,
		// 		height: gHeight,
		// 	};
		const updates = []; // Сюди збиратимемо оновлення

    	let measuredCount = 0;
			// Для кожного блоку зробити .measure
		blockRefs.current.forEach((ref, index) => {
			ref?.measure((bx, by, bWidth, bHeight, bPageX, bPageY) => {
				const block = { x: bPageX, y: bPageY };

				// Вираховуємо відносні координати
				const relativeX = block.x - gridLayout.value.x;
				const relativeY = block.y - gridLayout.value.y;

				// Визначаємо клітинку
				// const cellSize = gridLayout.value.width / 3;
				const screenWidth = Dimensions.get("window").width;

				const gridWidth = screenWidth * 0.45; // або скільки % займає твоя сітка
				const cellSize = gridWidth / 3;
				const col = Math.round(relativeX / cellSize);
				const row = Math.round(relativeY / cellSize);

				console.log(`Блок ${index} — Рядок ${row}, Колонка ${col}`);
				updateBlockValue(col, 'col', index)
				updateBlockValue(row, 'row', index)
				updates[index] = { row, col };

            	measuredCount++;
				 // Коли всі блоки виміряні — оновлюємо state
				//  if (measuredCount === blockRefs.current.length) {
				// 	// Коли всі блоки виміряні
				// 	setBlocks((prev) =>
				// 		prev.map((block, i) => ({
				// 			...block,
				// 			row: updates[i]?.row ?? block.row,
				// 			col: updates[i]?.col ?? block.col,
				// 		}))
				// 	);
				// }

			});
			// setBlocks((prevBlocks) =>
			// 	prevBlocks.map((block, i) => ({
			// 		...block,
			// 		...updates[i],
			// 	}))
			// );
		});
		setSendingData(true)
		// });
	};
	useEffect(() => {
		console.log('gggegelgjegj')
		console.log(blocks)
		if(sendingData){
			sendDataToBackend()
			setSendingData(false)
		}
		
	}, [blocks]); 

	
    const sendDataToBackend = async () => {
		console.log('got to send to backend');
		const requestBody ={
            blocksGrid : blocks,
            additionalData : blocks,
        }
		console.log('filled data for  backend');

        const token = await AsyncStorage.getItem('authToken');
		// console.log(blocks);

		try {
            console.log("phase 1");
            const response = await fetch('http://192.168.0.12:5000/api/result/block/saveResponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`

                },
                body: JSON.stringify(requestBody),  //перетворює масив або об'єкт на JSON-рядок
            })
            if (response.ok) {
                Alert.alert('Success', 'Your answers sent!');
                setGotResults(true);
            }
        } catch (error) {
        	Alert.alert('Failure', 'Can not send answers');

        }
		console.log(blocks);

		
	}


  return (
    <View style={styles.container}>
		<TouchableOpacity 
			style={[styles.imageContainer, { position: 'absolute', top: 10, right: 10 }]} 
			onPress={handleImagePress}
		>
			<Image 
			source={require("../../assets/complex_figure/complexFigure.png")} // Ваша URL картинки
			style={[styles.image, backgroundZoomed ? styles.zoomedImage : {}]} 
			resizeMode="contain"
			/>

		</TouchableOpacity>
		{blocks.map((block, index) => (
				<Block 
					key={block.id} 
					blockId={block.id} 
					gridPosition={gridLayout} 
					refCallback={(ref) => (blockRefs.current[index] = ref)}
					setBlocks={setBlocks}
					updateBlockValue={updateBlockValue}
				/>

		))}
		<View
			style={{ width: '45%', aspectRatio: 1,  }}
			onLayout={(event) => {
				const { x, y, width, height } = event.nativeEvent.layout;
				console.log('Grid layout:', x, y, width, height);
				gridLayout.value = { x, y };
				// console.log('Value grid layout:', gridLayout.value);

			}}
		>
			<Grid/>
		</View>

	
			
		<Button title="End test" onPress={checkBlocks}  />


		
	</View>

  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	
	imageContainer: {
		// padding: 5,
		backgroundColor: 'white',
		zIndex: 10, 
	  },
	  image: {
		width: 100,
		height: 100,
		// borderRadius: 5,
		borderRadius: 5,
		borderColor: 'black',
		borderWidth: 2,
	  },
	  zoomedImage: {
		width: 500, // Збільшений розмір
		height: 500,
		
		borderRadius: 5,
		borderColor: 'black',
		borderWidth: 2,
		zIndex: 1,
	  },
	  dot: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: 'red',
		position: 'absolute',
		top: 220,
		left: 399,

	  }
});
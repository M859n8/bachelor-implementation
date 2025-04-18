import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button,  TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import {useSharedValue, useAnimatedRef} from 'react-native-reanimated';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import * as ScreenOrientation from 'expo-screen-orientation';


import ResultsModal from '../../shared/resultsModal.js';
import RulesModal from '../../shared/RulesModal.js';

import Block from '../../shared/Block.js';
import Grid from '../../shared/Grid.js';
import Timer from '../../shared/Timer.js';

export default function BlockDesign() {
	const [rulesModal, setRulesModal] = useState(true);
	const [resultsModal, setResultsModal] = useState(false);
	const [results, setResults] = useState({ finalScore: 100 });
	const [timerIsRunning, setTimerIsRunning] = useState(false); 
	const [backgroundZoomed, setBackgroundZoomed] = useState(false);
	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); // Перемикання стану для збільшення
	};
	const [blocks, setBlocks] = useState([
		// { id: 0, position: [{ row: -1, col: -1 }], color: ['white'], rotation: [0 ]},
		// { id: 1, position: [{ row: -1, col: -1 }], color: ['white'], rotation: [0 ]},
		// { id: 2, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 3, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 4, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 5, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 6, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 7, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
		// { id: 8, position: [{ row: -1, col: -1 }], color: 'white', rotation: 0 },
	]);
	const gridLayout = useSharedValue({ x: 0, y: 0 });
	const blockRefs= useRef([]); // пустий масив refs
	const gridRef = useRef(null);
	const isFocused = useIsFocused(); //returns true when animation ended

	const [sendingData, setSendingData] = useState(false);

	const templates = {
		1: require('../../assets/blockdesign.png'),
		2: require('../../assets/visual_organiz/2.png'),
		3: require('../../assets/visual_organiz/3.png'),
	};

	// const gridSize = minDimension * 0.45;
	// const blockSize = minDimension * 0.15;


	const [cellSize, setCellSize] = useState(0);
	const [gridDimention, setGridDimention] = useState(3)
	const [blockSize, setBlockSize] = useState(100);
	const [currentRound, setCurrentRound] = useState(0);
	const totalRounds = 3;

	const [allRoundsData, setAllRoundsData] = useState([]);
	const [roundStartTime, setRoundStartTime] = useState(null);


	// console.log('grid size', gridSize, 'block size', blockSize)
	
	const [currentImageIndex, setCurrentImageIndex] = useState(1);
 

	useEffect(() => {
		
		if (!rulesModal) { //measure when rules are closed
			// setTimeout(() => {
			  gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
				console.log('Grid coords after navigation:', { pageX, pageY });
				gridLayout.value = { x: pageX, y: pageY }; 
			  });
			// }, 0); // трохи зачекати після фокусу
		  }
	}, [rulesModal]);

	useEffect(() => { //debug
		const unsubscribe = Dimensions.addEventListener('change', ({ window }) => {
			console.log('📐 Orientation changed:', window.width, window.height);
			// Тут можеш перевиміряти layout
		});
	
		return () => unsubscribe?.remove?.(); // безпечне видалення
	}, []);

	useEffect(() => {
		console.log('changing roudn');
		// Визначаємо розмір сітки
		
		const { width, height } = Dimensions.get('window');
		const minDimension = Math.min(width, height);

		const dimention = currentRound === 0 ? 3 : 4;
		setGridDimention(dimention)
		const currentCellSize= currentRound === 0 ? minDimension*0.45/dimention : minDimension*0.45/dimention;
		setCellSize(currentCellSize);
		setBlockSize(currentCellSize);
	
		console.log('dimention in chenging round', dimention, 'and', currentCellSize)
		// Створюємо масив блоків
		const totalBlocks = dimention * dimention;
		const newBlocks = Array.from({ length: totalBlocks }, (_, i) => ({
			id: i,
			position: { row: 0, col: 0},
			color: "white",
			rotation: 0,
			changesCount: 0,
		}));

		setBlocks(newBlocks);
		setCurrentImageIndex(currentImageIndex + 1);
		// Скидуємо таймер
		// setTimer(15); // або інше значення для цього раунду
		console.log('from usestate', gridDimention, 'and', cellSize)
	
	}, [currentRound]);

	
	const goToNextRound = () => {
		const now = Date.now();
		// Зберігаємо поточні блоки у масив з історією
		const newRoundData = {
			round: currentRound,
			gridDimention: gridDimention,
			startTime: roundStartTime,
			endTime: now,
			blocks: [...blocks],

		};
		if (currentRound + 1 < totalRounds) {
			setAllRoundsData((prev) => [...prev, newRoundData]);
			setCurrentRound((prev) => prev + 1);
			setRoundStartTime(Date.now()); 
		} else {
			// останній — додаємо в ручну копію allRoundsData
			const finalData = [...allRoundsData, newRoundData];
			sendDataToBackend(finalData); //посилаю в цю функцію мануально, а не через юзстейт, бо він не встигаж оновитися 
		}
	};


	const updateBlockValue = (newValue, type, blockId) => {
		console.log('got to update block value', newValue, 'type', type)
		
		setBlocks((prevBlocks) => {

			const updatedBlock = {
				...prevBlocks[blockId],
				[type]: type === 'changesCount'
				? prevBlocks[blockId][type] + 1
				: newValue,
			};
			// const updatedBlock = { 
			//   ...prevBlocks[blockId],
			//   // В залежності від типу додаємо нове значення до відповідного масиву
			//   [type]: type === 'changesCount'
			// 	? prevBlocks[blockId][type] + 1
			// 	: [...prevBlocks[blockId][type], newValue]
			// };
		
			return [
			  ...prevBlocks.slice(0, blockId),
			  updatedBlock,
			  ...prevBlocks.slice(blockId + 1)
			];
		  });
		
		
		// console.log('updated');
	};

	// useEffect(() => {
	// 	checkBlocks();
	// }, [elements]);


	
	
    const sendDataToBackend = async (data) => {
		console.log('got to send to backend');
		setTimerIsRunning(false);

		const requestBody ={
            roundBlocks: data,
            additionalData : blocks,
        }
		console.log('filled data for  backend');
		console.log(JSON.stringify(allRoundsData, null, 2));

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
			const result = await response.json();
            if (response.ok) {
				setResults(result); 
				setResultsModal(true);
            }
        } catch (error) {
        	Alert.alert('Failure', 'Can not send answers');

        }

		
	}


  return (
    <View style={styles.container}>
		<View style={styles.dot}/> 
		<RulesModal 
			visible={rulesModal} 
			rules='Complete a template using blocks.' 
			onClose={() => {
				setRulesModal(false);
				setRoundStartTime(Date.now());
				setTimerIsRunning(true);

			}} 
		/>

		<ResultsModal 
			visible={resultsModal} 
			results={results} 
			onClose={() => setResultsModal(false)} 
		/>
		<Timer isRunning={timerIsRunning} startTime={0}/>

		<TouchableOpacity 
			style={[styles.imageContainer, { position: 'absolute', top: 10, right: 10 }]} 
			onPress={handleImagePress}
		>
			<Image 
			source={templates[currentImageIndex]} // Ваша URL картинки
			style={[styles.image, backgroundZoomed ? styles.zoomedImage : {}]} 
			resizeMode="contain"
			/>

		</TouchableOpacity>
		
		<View
			// style={{ width: gridSize, aspectRatio: 1}}

			// onLayout={(event) => {
			// 	const { x, y, width, height } = event.nativeEvent.layout;
			// 	console.log('Grid layout:', x, y, width, height);
			// 	gridLayout.value = { x, y };
			// 	// console.log('Value grid layout:', gridLayout.value);

			// }}
			
			ref={gridRef}
			
		>
			<Grid  cellSize={cellSize} dimention={gridDimention}/>
		</View>
		<View style={{ marginVertical: 10 }}>
			<Button title="End test" onPress={goToNextRound} />
		</View>


		<View style={{
			width: '100%',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
			gap: 10,
			paddingTop: 10,
			}}>
			{blocks.map((block, index) => (
				<Block  
					key={block.id + '_' + currentRound}  //враховуємо також раунд, щоб реакт повністю перемалював весь блок 
					blockId={block.id} 
					gridPosition={gridLayout} 
					refCallback={(ref) => (blockRefs.current[index] = ref)}
					setBlocks={setBlocks}
					updateBlockValue={updateBlockValue}
					blockSize={blockSize}
					cellSize={cellSize}
				/>
					

			))}
		</View>
		
	</View>

  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#E0FFFF', // Колір фону

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
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: 'red',
		position: 'absolute',
		left: 331,
		top: 362,
		zIndex: 10

	  }
});
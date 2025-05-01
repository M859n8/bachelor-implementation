import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button, Modal, TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import {useSharedValue, useAnimatedRef} from 'react-native-reanimated';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '../../shared/CustomButton.js';

import * as ScreenOrientation from 'expo-screen-orientation';

import RulesModal from '../../shared/RulesModal.js';
import Block from '../../shared/Block.js';
import Grid from '../../shared/Grid.js';
import Timer from '../../shared/Timer.js';

export default function BlockDesign() {
	const [rulesModal, setRulesModal] = useState(true);
	// const [resultsModal, setResultsModal] = useState(false);
	// const [results, setResults] = useState({ finalScore: 100 });
	const [timerIsRunning, setTimerIsRunning] = useState(false); //state for timer
	// const [currentImageIndex, setCurrentImageIndex] = useState(1); //current template index
	
	const [blocks, setBlocks] = useState([]); //blocks array
	const gridLayout = useSharedValue({ x: 0, y: 0 }); //grid position
	const blockRefs= useRef([]); // array for blocks refs
	const gridRef = useRef(null); //grid fer
	// const isFocused = useIsFocused(); //returns true when animation ended

	// const [sendingData, setSendingData] = useState(false);

	const templates = { //templates array
		0: require('../../assets/blockDesign/block1.png'),
		1: require('../../assets/blockDesign/block2.png'),
		2: require('../../assets/blockDesign/block3.png'),
	};

	const [cellSize, setCellSize] = useState(0); //cell size, adaptive to orientation
	const [blockSize, setBlockSize] = useState(100); //block size, adaptive to orientation changes
	const [gridDimention, setGridDimention] = useState(3) //grid dimension, varies by round
	const [currentRound, setCurrentRound] = useState(0); 
	const totalRounds = 3;

	const [allRoundsData, setAllRoundsData] = useState([]); //data for all rounds, this array will be send to backend
	const [roundStartTime, setRoundStartTime] = useState(null); //to save each round start time

	const navigation = useNavigation(); //for navigation home

	const [backgroundZoomed, setBackgroundZoomed] = useState(false); //state for zooming template picture
	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); 
	};
 

	useEffect(() => {
		
		if (!rulesModal) { //measure grid position after closiing rules
			  gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
				// console.log('Grid coords after navigation:', { pageX, pageY });
				gridLayout.value = { x: pageX, y: pageY }; 
			  });
		  }
	}, [rulesModal]);

	// useEffect(() => { //debug
	// 	const unsubscribe = Dimensions.addEventListener('change', ({ window }) => {
	// 		console.log('📐 Orientation changed:', window.width, window.height);
	// 		// Тут можеш перевиміряти layout
	// 	});
	
	// 	return () => unsubscribe?.remove?.(); // безпечне видалення
	// }, []);

	useEffect(() => { //for each round calculate grid, cell and block size
		
		const { width, height } = Dimensions.get('window');
		const minDimension = Math.min(width, height);

		const dimention = currentRound === 0 ? 3 : 4; //3 cells only on zero round
		setGridDimention(dimention)
		const currentCellSize = minDimension * 0.45 / dimention;
		setCellSize(currentCellSize);
		setBlockSize(currentCellSize);
	
		//initialise blocks
		const totalBlocks = dimention * dimention;
		const newBlocks = Array.from({ length: totalBlocks }, (_, i) => ({
			id: i,
			position: { row: 0, col: 0},
			color: "white",
			rotation: 0,
			changesCount: 0,
		}));

		setBlocks(newBlocks);
	
	}, [currentRound]);

	
	const goToNextRound = () => {
		//get end time
		const now = Date.now();
		// save current round data
		const currentRoundData = {
			round: currentRound,
			gridDimention: gridDimention,
			startTime: roundStartTime,
			endTime: now,
			blocks: [...blocks],

		};
		//if it not last round
		if (currentRound + 1 < totalRounds) {
			setAllRoundsData((prev) => [...prev, currentRoundData]);
			//go to next round
			setCurrentRound((prev) => prev + 1);
			setRoundStartTime(Date.now()); 
		} else {
			//otherwise set final data for all rounds (i do not use useState because it does not have time to update)
			const finalData = [...allRoundsData, currentRoundData];
			sendDataToBackend(finalData); 
		}
	};

	//updating block value of a given type
	const updateBlockValue = (newValue, type, blockId) => {
		//for changesCount just increase value by 1
		setBlocks((prevBlocks) => {

			const updatedBlock = {
				...prevBlocks[blockId],
				[type]: type === 'changesCount'
				? prevBlocks[blockId][type] + 1
				: newValue,
			};
		
			return [
			  ...prevBlocks.slice(0, blockId),
			  updatedBlock,
			  ...prevBlocks.slice(blockId + 1)
			];
		  });
		
	};

    const sendDataToBackend = async (data) => {
		//stoop the timer
		setTimerIsRunning(false);
		// console.log(JSON.stringify(allRoundsData, null, 2));

        const token = await AsyncStorage.getItem('authToken'); //get authorization token
		try {
            const response = await fetch('http://192.168.0.12:5000/api/result/block/saveResponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({roundBlocks: data}),  //transform object into json string
            })
			const result = await response.json();
            if (response.ok) {
				//go to result page
				navigation.navigate('Results', { result });
            }
        } catch (error) {
        	Alert.alert('Failure', 'Can not send answers');
        }		
	}


  return (
    <View style={styles.container}>
		<RulesModal 
			visible={rulesModal} 
			rules='Complete a template using blocks.' 
			onClose={() => {
				setRulesModal(false);
				setRoundStartTime(Date.now());
				setTimerIsRunning(true);

			}} 
		/>

		<Timer isRunning={timerIsRunning} startTime={roundStartTime}/>

		<TouchableOpacity 
			style={[styles.imageContainer, { position: 'absolute', top: 10, right: 10 }]} 
			onPress={handleImagePress}
		>
			<Image 
			source={templates[currentRound]} // Ваша URL картинки
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
			<CustomButton title="End test" onPress={goToNextRound} />
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
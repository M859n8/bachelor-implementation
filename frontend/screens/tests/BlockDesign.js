/**
 * Author: Maryna Kucher
 * Description: Main file for the Block Design Test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import {useSharedValue} from 'react-native-reanimated';
import { useNavigation} from '@react-navigation/native';
import CustomButton from '../../shared/CustomButton.js';

import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';

import RulesModal from '../../shared/RulesModal.js';
import Block from '../../shared/Block.js';
import Grid from '../../shared/Grid.js';
import Timer from '../../shared/Timer.js';
import {sendRequest} from '../../shared/sendRequest.js';

export default function BlockDesign() {
	const navigation = useNavigation(); //used to navigate to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //used to update the auth flag based on server response

	const { width, height } = Dimensions.get('window');

	const [rulesModal, setRulesModal] = useState(true); //rules modal at the start 
	const [timerIsRunning, setTimerIsRunning] = useState(false); //state for timer
	
	const [blocks, setBlocks] = useState([]); //blocks array
	const gridLayout = useSharedValue({ x: 0, y: 0 }); //grid position
	const gridRef = useRef(null); //grid ref for position measuring

	const templates = { //templates sources array
		0: require('../../assets/blockDesign/block1.png'),
		1: require('../../assets/blockDesign/block2.png'),
		2: require('../../assets/blockDesign/block3.png'),
	};

	const [cellSize, setCellSize] = useState(0); //cell size, adaptive to orientation
	const [blockSize, setBlockSize] = useState(100); //block size, adaptive to orientation changes
	const [gridDimention, setGridDimention] = useState(3) //grid dimension, varies by round
	const [currentRound, setCurrentRound] = useState(0); 
	const totalRounds = 3;

	const [allRoundsData, setAllRoundsData] = useState([]); //data from all rounds, this array will be sent to backend
	const [roundStartTime, setRoundStartTime] = useState(null); //to save each round start time


	const [backgroundZoomed, setBackgroundZoomed] = useState(false); //state for zooming template picture
	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); 
	};
 

	useEffect(() => {
		
		if (!rulesModal) { //measure grid position after closing rules modal
			  gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
				gridLayout.value = { x: pageX, y: pageY }; 
			  });
		  }
	}, [rulesModal]);


	useEffect(() => { //for each round calculate grid, cell and block size
		
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
		//if it is not last round
		if (currentRound + 1 < totalRounds) {
			setAllRoundsData((prev) => [...prev, currentRoundData]);
			//go to next round
			setCurrentRound((prev) => prev + 1);
			setRoundStartTime(Date.now()); 
		} else {
			//final data are sent directly because useState does not have 
			//time to update data about last round due to asynchrony
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
		//stop the timer
		setTimerIsRunning(false);
		const requestBody={ roundBlocks : data};

		//send data to the backend using separate component from ../shared/directory
		await sendRequest({
			url: 'http://localhost:5000/api/result/block/saveResponse',
			body: requestBody,
			setIsAuthenticated,
			navigation,
			onSuccess: result => navigation.navigate('Results', { result })
		});

  	
	}


  return (
    <View style={styles.container} >
		<RulesModal 
			visible={rulesModal} 
			rules='The game has three rounds. You have to complete a template from blocks as quickly as possible and with the fewest moves. The blocks change color with a single tap (there are three colors:  white, mixed and red) and the angle of rotation with a double tap.' 
			onClose={() => {
				setRulesModal(false);
				setRoundStartTime(Date.now());
				setTimerIsRunning(true);

			}} 
		/>

		<Timer isRunning={timerIsRunning} startTime={roundStartTime}/>

		<TouchableOpacity  //show template in the top right corner
			style={[styles.imageContainer, { position: 'absolute', top: 10, right: 10 }]} 
			onPress={handleImagePress}
		>
			<Image 
			source={templates[currentRound]} 
			style={[styles.image, backgroundZoomed ? styles.zoomedImage : {}]} 
			resizeMode="contain"
			/>

		</TouchableOpacity>
		
		<View ref={gridRef}>
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
					//create key from block id and round id, so that react completely redraws the entire block
					key={block.id + '_' + currentRound}  
					blockId={block.id} 
					gridPosition={gridLayout} 
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
		backgroundColor: '#F5F5F5', 

	},
	
	imageContainer: {
		backgroundColor: 'white',
		zIndex: 10, 
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 5,
		borderColor: '#fff',
		borderWidth: 2,
	},
	zoomedImage: {
		width: 500, 
		height: 500,
		
		borderRadius: 5,
		borderColor: '#fff',
		borderWidth: 2,
		zIndex: 1,
	},

});
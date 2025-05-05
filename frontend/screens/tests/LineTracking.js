import React, { useRef, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions,Text, Modal, Button, UIManager, findNodeHandle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import RulesModal from '../../shared/RulesModal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// import { PathProperties } from 'svg-path-properties';
import { svgPathProperties } from "svg-path-properties";

import Animated from 'react-native-reanimated';
import {
	useSharedValue,useAnimatedStyle,withSpring,
	withTiming,runOnJS,useAnimatedRef, measure, runOnUI, getRelativeCoords 
  } from 'react-native-reanimated';

export default function LineTracking() {
	const LINE_WIDTH = 30;
	const navigation = useNavigation(); 

	const [path, setPath] = useState([]);

	const [currentRound, setCurrentRound] = useState(1);
	const [round2Modal, setRound2Modal] = useState(false);
	const [round1Modal, setRound1Modal] = useState(true);

	const linesRound1 = useRef([]);
	const localRef = useRef(null); 
	const [startMarkPos, setStartMarkPos] = useState({x: 0, y: 0});
	
	const viewRef = useRef(null);
	const [svgPathD, setSvgPathD] = useState('')

	const start = useSharedValue({ x: 0, y: 0 });
	const offset = useSharedValue({ x: 0, y: 0 });

	// const { width, height } = Dimensions.get('window');
	// const [windowSize, setWindowSize] = useState(Dimensions.get("window"));
	const [width, setWidth ] = useState(0);
	const [height, setHeight] = useState(0);



	const additionalData = useRef( {
		windowWidth: 0, 
		windowHeight: 0,
		completionRound1: 0,
		completionRound2: 0,

	});

	//measure status bar height
	const statusBarHeight = useRef(0)
	useEffect(() => { 
		if (viewRef.current) {
			viewRef.current.measure((x, y, width, height, pageX, pageY) => {
				statusBarHeight.current = pageY;
				setWidth(width);
				setHeight(height);

			});
		}

	}, []);

	const checkPointIndex = useRef(0); //check points to track path copletion
	const [checkPoints, setCheckPoints] = useState([
		//spiral
		{ x: 0.2, y: 0.55 }, 
		{ x: 0.16, y: 0.52 },
		{ x: 0.2, y: 0.46 }, 
		{ x: 0.26, y: 0.52 }, 
		{ x: 0.2, y: 0.69 }, 
		{ x: 0.08, y: 0.52 }, 
		{ x: 0.2, y: 0.35 }, 
		//hill
		{ x: 0.36, y: 0.62 }, 
		{ x: 0.425, y: 0.50 }, 
		{ x: 0.5, y: 0.35 }, 
		{ x: 0.575, y: 0.50 }, 
		{ x: 0.64, y: 0.62 }, 
		//stairs 
		{ x: 0.65, y: 0.55 },
		{ x: 0.75, y: 0.55 },  
		{ x: 0.75, y: 0.45 },  
		{ x: 0.85, y: 0.45 },  
		{ x: 0.85, y: 0.35 },
		{ x: 0.95, y: 0.35 },
		{ x: 0.95, y: 0.55 },
		{ x: 0.95, y: 0.70 },
		{ x: 0.82, y: 0.70 },
		
	]);

	//function that generates first part of a template  - Archimedean Spiral
	const generateArchimedeanSpiral = ({
		centerX = 0.2,
		centerY = 0.6,
		turns = 2,
		pointsCount = 200,
		maxRadius = 0.15 
	} = {}) => {
		const points = [];
	
		for (let i = 0; i < pointsCount; i++) {
			const t = (i / (pointsCount - 1)) * 2 * Math.PI * turns;
			const r = (t / (2 * Math.PI * turns)) * maxRadius; // від 0 до maxRadius
			const x = centerX + r * Math.cos(t);
			const y = centerY + 1.5*r * Math.sin(t) - 0.05 ;
			points.push({ x, y });
		}
	
		return points;
	};

	const generateTemplate = () => {
		const spiral = generateArchimedeanSpiral();
		const zigzag = [
			{ x: 0.35, y: 0.65 }, 
			{ x: 0.5, y: 0.35 },  
			{ x: 0.65, y: 0.65 },  
			{ x: 0.65, y: 0.55 },
			{ x: 0.75, y: 0.55 },  
			{ x: 0.75, y: 0.45 },  
			{ x: 0.85, y: 0.45 },  
			{ x: 0.85, y: 0.35 },
			{ x: 0.95, y: 0.35 },
			{ x: 0.95, y: 0.70 },
			{ x: 0.80, y: 0.70 },
			
		];
		const result = [...spiral, ...zigzag];
		return result;
	};

	useEffect(() => {
		if(width>0 && height>0){
			//update additional data
			additionalData.current.windowHeight = height;
			additionalData.current.windowWidth = width;
			//generate template string
			const template = normalizePoints(generateTemplate());
			console.log('width and height', width, height)
			const templateSvg = convertPointsToPath(template);
			setSvgPathD(templateSvg)

			//save the first point to set the mark position
			const firstPoint = template[0] ;
			console.log('stert point', firstPoint)
			setStartMarkPos({x: firstPoint.x, y: firstPoint.y})
			//normalise check points coords
			setCheckPoints(normalizePoints(checkPoints))


		}
		
	}, [width, height]);
	
	const handleEndRound = () => {
		//check current round
		if (currentRound === 1) {
			linesRound1.current = path; //save round one path
			setPath([]); //clear the path for round 2
			// Завершився перший раунд, змінюємо на другий і показуємо модальне вікно з правилами
			setCurrentRound(2);
			setRound2Modal(true);  //show modal with the rules
			additionalData.current.completionRound1 = checkPointIndex.current/checkPoints.length;
			checkPointIndex.current = 0; //update check point index

			//return object on start position 
			start.value = { x: 0, y: 0 };
			offset.value = { x: 0, y: 0 };
		} else if (currentRound === 2) {
			//after round 2 send data to backend
			additionalData.current.completionRound2 = checkPointIndex.current/checkPoints.length;
			sendDataToBackend(path);
		}
	};

	//function to adjust coordinates of the points according to the screen width and height
	const normalizePoints = (coords) => {
		// console.log('width', width, height)
		console.log('start position', startMarkPos.x, startMarkPos.y)

		return coords.map(({ x, y }) => ({
			x: x * width,
			y: y * height,
		}));
	};

	//function to check approaching to the checkpoint
	const isNear = ( point1, point2, threshold = LINE_WIDTH) => {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		return dx * dx + dy * dy <= threshold * threshold;
	}
	
	//animated styles to display object movement
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y }
		],
	}));
	//gesture that implements touch processing
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			const x = e.absoluteX;
			const y = e.absoluteY - statusBarHeight.current;//normalize position to statusBar height
			setPath([{ x, y }]); //add start point
		})
		.onUpdate((e) => {
			const x= e.absoluteX;
			const y= e.absoluteY-statusBarHeight.current; 

			setPath((prevPoints) => [...prevPoints, { x, y }]); //update points in user path
			offset.value = {
				x: e.translationX + start.value.x,
				y: e.translationY + start.value.y,
			};

			if (checkPointIndex.current >= checkPoints.length) return; //all check points are passed

			const nextCheckpoint = checkPoints[checkPointIndex.current]; //otherwise get next check point
			if (isNear({x, y}, nextCheckpoint)) { //check if this point is near
				checkPointIndex.current++; //then set next checkPoint index
			}
		})
		.onEnd(() => {
			start.value = { //update start value
				x: offset.value.x,
				y: offset.value.y,
			};
			handleEndRound(); //after each gesture end process end round

		})
		.runOnJS(true);

	//convert points to svg path 
	const convertPointsToPath = (points) => {
		if (points.length === 0) return ''; //check if there is points in array
		//set the first point in svg string
		const [start, ...rest] = points;
		let result = `M${start.x},${start.y} `;
		//add rest of points
		result += rest.map(p => `L${p.x},${p.y}`).join(' ');
		return result;
	};


	const sendDataToBackend = async (data) => {
		const requestBody = {
			userLinesRound1: convertPointsToPath(linesRound1.current),
			userLinesRound2: convertPointsToPath(data),
			templateLines: svgPathD,
			additionalData: additionalData.current,
		}
		// console.log('passed tehe request body ',additionalData.current);

		const token = await AsyncStorage.getItem('authToken'); //get authorization token
		try {
			const response = await fetch('http://192.168.0.12:5000/api/result/line/saveResponse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(requestBody),  //transform object into json string
			})
			const result = await response.json();
			if (response.ok) {
				// console.log('got to results')
				//go to result page
				navigation.navigate('Results', { result });
			}
		} catch (error) {
			Alert.alert('Failure', 'Can not send answers');
		}		
	};
		
	return (
		<View 
			style={styles.container} 
			// onLayout={(event) => {
			// 	const { width, height , pageX, pageY} = event.nativeEvent.layout;
			// 	console.log('Measured from layout:', width, height);
			// 	setWidth(width);
			// 	setHeight(height);
			// 	statusBarHeight.current = pageY;
			// 	console.log('y is' , pageY)
			// }}
			ref={viewRef}
		>

		<RulesModal 
			visible={round1Modal} 
			rules='Round 1 rules: lorem ipsum' 
			onClose={() => {
				setRound1Modal(false);
				

			}} 
		/>
		
		<RulesModal 
			visible={round2Modal} 
			rules='Round 2 rules: lorem ipsum' 
			onClose={() => {
				setRound2Modal(false);
			}}
		/>
		<>
			<View>
			<Svg
				width={width}
				height={height}
				style={[styles.template]}
			>
				<Path //template path
					d={svgPathD}
					stroke="lightgray"
					strokeWidth={LINE_WIDTH}
					fill="none"
				/>
				{path.length > 0 &&  //user path
					<Path 
						d={convertPointsToPath(path)} 
						stroke="black" 
						strokeWidth={2} 
						fill="none" 
					/>
				} 
			</Svg>
			</View>
			<GestureDetector gesture={panGesture}>
				
				<Animated.View
					ref={localRef}
					style={[{
						width: LINE_WIDTH/2,
						height: LINE_WIDTH/2,
						borderRadius: LINE_WIDTH/4,
						position: 'absolute', // обов'язково, інакше translate не буде працювати правильно
						top: startMarkPos.y,
						left: startMarkPos.x,
						backgroundColor: 'red'
					},
					animatedStyle, //connect animation
					]}
				/>
			
			</GestureDetector>
			<Text>{startMarkPos.y}  {startMarkPos.x} </Text>

			{checkPoints.map((point, index) => ( //check points 
				<View 
					key={index}
					style={{
						width: 5,
						height: 5,
						backgroundColor: 'red',
						borderRadius: 3, // щоб були круглі
						position: 'absolute',
						top: point.y,
						left: point.x,
						zIndex: 100,
					}}
				/>
			))}
        </>
	</View>
		
	);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoBox: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 10,
        borderRadius: 10
    }
});
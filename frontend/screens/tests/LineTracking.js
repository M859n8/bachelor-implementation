import React, { useRef, useState, useEffect} from 'react';
import { StyleSheet, View, Text} from 'react-native';
import Svg, { Path} from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import RulesModal from '../../shared/RulesModal.js';
import { useNavigation } from '@react-navigation/native';
import {sendRequest} from '../../shared/sendRequest.js';

import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';

import Animated from 'react-native-reanimated';
import {useSharedValue,useAnimatedStyle} from 'react-native-reanimated';

export default function LineTracking() {
	const LINE_WIDTH = 30; //width of the template path

	const navigation = useNavigation(); //using for navigation to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //using for updating auth flag based on server response

	const [path, setPath] = useState([]); //user path

	const [currentRound, setCurrentRound] = useState(1); //current rount
	const [round2Modal, setRound2Modal] = useState(false); //modal with fules for each round
	const [round1Modal, setRound1Modal] = useState(true);

	const linesRound1 = useRef([]); //save lines from the first round

	const [startMarkPos, setStartMarkPos] = useState({x: 0, y: 0}); //save template start pos
	
	const viewRef = useRef(null); //ref of the main view, allows us to measure top shift

	const [svgPathD, setSvgPathD] = useState(''); //template path

	const start = useSharedValue({ x: 0, y: 0 }); //mark start pos
	const offset = useSharedValue({ x: 0, y: 0 }); //offset during movement

	const [width, setWidth ] = useState(0); //view size
	const [height, setHeight] = useState(0);

	const additionalData = useRef( { //metadata that will be send to the backend
		windowWidth: 0, 
		windowHeight: 0,
		completionRound1: 0,
		completionRound2: 0,

	});

	//measure status bar height (top shift of the main view)
	const statusBarHeight = useRef(0)
	useEffect(() => { 
		if (viewRef.current) {
			viewRef.current.measure((x, y, width, height, pageX, pageY) => {
				statusBarHeight.current = pageY;
				setWidth(width); //set width and height of the main view/game area
				setHeight(height);

			});
		}
	}, []);

	const checkPointIndex = useRef(0); //check points to track path completion
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
			//calculate angle and current radius
			const t = (i / (pointsCount - 1)) * 2 * Math.PI * turns;
			const r = (t / (2 * Math.PI * turns)) * maxRadius; 
			//get coords of the point
			const x = centerX + r * Math.cos(t);
			const y = centerY + 1.5*r * Math.sin(t) - 0.05 ; //verticaly elongated
			points.push({ x, y });
		}
	
		return points;
	};
	//generate whole template 
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

	//create a template 
	useEffect(() => {
		if(width>0 && height>0){
			//update additional data
			additionalData.current.windowHeight = height;
			additionalData.current.windowWidth = width;
			//generate template string and adapt to current screen sizes
			const template = normalizePoints(generateTemplate());
			const templateSvg = convertPointsToPath(template);
			setSvgPathD(templateSvg)

			//save the first point to set the mark position
			const firstPoint = template[0] ;
			setStartMarkPos({x: firstPoint.x, y: firstPoint.y})
			//normalise check points coords
			setCheckPoints(normalizePoints(checkPoints))
		}
		
	}, [width, height]);
	
	//by end of the round move to the next one or finish the test
	const handleEndRound = () => {
		//check current round
		if (currentRound === 1) {
			linesRound1.current = path; //save round one path
			setPath([]); //clear the path for round 2
			//go to the second round
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

	//send data to the backend and show results
	const sendDataToBackend = async (data) => {
		const requestBody = {
			userLinesRound1: convertPointsToPath(linesRound1.current),
			userLinesRound2: convertPointsToPath(data),
			templateLines: svgPathD,
			additionalData: additionalData.current,
		}

		await sendRequest({
			url: 'http://192.168.0.12:5000/api/result/line/saveResponse',
			body: requestBody,
			setIsAuthenticated,
			navigation,
			onSuccess: result => navigation.navigate('Results', { result })
		})
		
	};
		
	return (
		<View style={styles.container} ref={viewRef}>

		<RulesModal 
			visible={round1Modal} 
			rules='This test consists of two rounds, in the first round, using your dominant hand, move the target object (green circle) to the end of the path. Try not to go outside the path.' 
			onClose={() => {setRound1Modal(false)}} 
		/>
		
		<RulesModal 
			visible={round2Modal} 
			rules='Now your task is the same, but do it with your non-dominant hand.' 
			onClose={() => {setRound2Modal(false)}}
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
					stroke="#C4E3D7"
					strokeWidth={LINE_WIDTH}
					fill="none"
				/>
				{path.length > 0 &&  //user path
					<Path 
						d={convertPointsToPath(path)} 
						stroke="#4CAF50" 
						strokeWidth={2} 
						fill="none" 
					/>
				} 
			</Svg>
			</View>
			<GestureDetector gesture={panGesture}> 
				<Animated.View //target object (circle)
					style={[{
						width: LINE_WIDTH/2,
						height: LINE_WIDTH/2,
						borderRadius: LINE_WIDTH/4,
						position: 'absolute', 
						top: startMarkPos.y,
						left: startMarkPos.x,
						backgroundColor: '#4CAF50',
						zIndex: 20,

					},
					animatedStyle, //connect animation
					]}
				/>
			
			</GestureDetector>

			{checkPoints.map((point, index) => ( //check points 
				<View 
					key={index}
					style={{
						width: 5,
						height: 5,
						backgroundColor: '#fff',
						borderRadius: 3,
						position: 'absolute',
						top: point.y,
						left: point.x,
						zIndex: 10,
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
		backgroundColor: '#fff',
    },
   
});
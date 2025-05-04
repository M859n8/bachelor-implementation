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
	const [modalVisible, setModalVisible] = useState(true);
	const { width, height } = Dimensions.get('window');
	const [path, setPath] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const allStrokes = useSharedValue([]);
    const containerOffset = useRef({ x: 0, y: 0 });

	const [currentRound, setCurrentRound] = useState(1);
	const [round2Modal, setRound2Modal] = useState(false);
	const [round1Modal, setRound1Modal] = useState(true);


	const [userLines, setUserLines] = useState([]); //round 1
	const localRef = useRef(null); 
	const [startMarkPos, setStartMarkPos] = useState({x: 0, y: 0});
	
	const viewRef = useRef(null);
	const [templatePoints, setTemplatePoints] = useState([])
	const [svgPathD, setSvgPathD] = useState('')
	const [referencePoints, setReferencePoints] = useState({})
	const [mistakesCount, setMistakesCount] = useState(0)

	const navigation = useNavigation(); 

	const start = useSharedValue({ x: 0, y: 0 });
	const offset = useSharedValue({ x: 0, y: 0 });

	const statusBarHeight = useRef(0)
	// const properties = new PathProperties(svgPathD);
	// const pathLength = properties.getTotalLength();
	const additionalData = useRef( {
		windowWidth: width, 
		windowHeight: height,
		completionRound1: 0,
		completionRound2: 0,

	});

	const checkPointIndex = useRef(0);
	const [checkPoints, setCheckPoints] = useState([
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

	const generateArchimedeanSpiral = ({
		centerX = 0.2,
		centerY = 0.6,
		turns = 2,
		pointsCount = 200,
		maxRadius = 0.15 // в координатах 0–1
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

	// useEffect(()=>{
	// 	if (currentRound === 2) {
	// 		setRound2Modal(true)
	// 	}


	// }, [currentRound])

	useEffect(() => {
		const template = generateTemplate();
		setTemplatePoints(template);
		const templateSvg = convertTemplatePointsToPath(template);
		setSvgPathD(templateSvg)
		const firstPoint = template[0] ;
		const lastPoint = template[template.length - 1];	

		console.log('starr', lastPoint.x, lastPoint.y)
		setStartMarkPos({x: firstPoint.x*width, y: firstPoint.y*height})
		// console.log('template last point', template[-1].value.x);


		// const properties = new svgPathProperties(templateSvg);
		const properties = new svgPathProperties(templateSvg);
		const pathLength = properties.getTotalLength();
		// console.log(templateSvg)
		// Збираємо точки через певний інтервал
		const numPoints = 1000;
		const pathPoints = Array.from({ length: numPoints }, (_, i) => {
			const lengthAtPoint = (i / (numPoints - 1)) * pathLength;
			return properties.getPointAtLength(lengthAtPoint);
		});
		setReferencePoints(pathPoints)
		// console.log('path points', pathPoints[3])
		setCheckPoints(normalizePoints(checkPoints))

	}, []);

	

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
		if (viewRef.current) {
			viewRef.current.measure((x, y, width, height, pageX, pageY) => {
				console.log('Measured:', { x: pageX, y: pageY, width, height });
				containerOffset.current = { x: pageX, y: pageY };
				statusBarHeight.current = pageY;

			});
		}

	}, []);
	
	const handleEndRound = () => {
		// const newLine = normalizePath(path);
		if (currentRound === 1) {
			// setUserLines(newLine)
			setUserLines(path)
			setPath([])
			// Завершився перший раунд, змінюємо на другий і показуємо модальне вікно з правилами
			setCurrentRound(2);
			console.log('SET ROUND 2 MODAL TRUE')
			setRound2Modal(true);  // Показуємо модальне вікно з правилами
			additionalData.current.completionRound1 = checkPointIndex.current/checkPoints.length;
			checkPointIndex.current = 0;

			 // Повертаємо об'єкт на початкову позицію
			if (templatePoints.length > 0) { //для дебагу щоб малювати оту лінію. можливо щалишу 
				const startPoint = templatePoints[0];
				start.value = { x: startPoint.x, y: startPoint.y };
				offset.value = { x: startPoint.x, y: startPoint.y };
			} else {
				start.value = { x: 0, y: 0 };
				offset.value = { x: 0, y: 0 };
			}
		} else if (currentRound === 2) {
			console.log('got to if')
			additionalData.current.completionRound2 = checkPointIndex.current/checkPoints.length;
			// Завершився другий раунд, викликаємо функцію для відправки результатів на бекенд
			sendDataToBackend(path);
			// setCurrentRound(1);  // Повертаємось до першого раунду (або зупиняємо гру)
		}
	};

	const normalizePoints = (coords) => {
		
		return coords.map(({ x, y }) => ({
			x: x * width,
			y: y * height,
		}));
	};

	const pathRef = useRef([]);

	const isNear = ( point1, point2, threshold = LINE_WIDTH) => {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		return dx * dx + dy * dy <= threshold * threshold;
	}
	
	

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y }
		],
	}));
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			const{x,y} = e
			setPath([]);
			setDrawing(true)
		})
		.onUpdate((e) => {
			const x= e.absoluteX
			const y= e.absoluteY-statusBarHeight.current

			// console.log('🖊️ drawing:', x, y);
			setPath((prevPoints) => [...prevPoints, { x, y }]); 
			offset.value = {
				x: e.translationX + start.value.x,
				y: e.translationY + start.value.y,
			};

			if (checkPointIndex.current >= checkPoints.length) return; // Всі пройдені

			const nextCheckpoint = checkPoints[checkPointIndex.current];
			if (isNear({x, y}, nextCheckpoint)) {
				// checkPoints[checkPointIndex.current].reached = true;
				checkPointIndex.current++;
				console.log('✅ Контрольна точка пройдена:', checkPointIndex.current);
			}
		})
		.onEnd(() => {
			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			handleEndRound()

		})
		.runOnJS(true);

		const sendDataToBackend = async (data) => {
			console.log('got to send')
			// const svgUserD = convertPointsToPath(data)

			
			const requestBody = {
				// userLines: [userLines, data],
				// templateLines: templatePoints,
				userLinesRound1: convertPointsToPath(userLines),
				userLinesRound2:convertPointsToPath(data),
				templateLines: svgPathD,
				additionalData: additionalData.current,
				// additionalData: {
				// 	windowWidth: width, 
				// 	windowHeight: height,
				// 	pathCompletionRight: checkPointIndex.current/checkPoints.length,
				// 	pathCompletionLeft: checkPointIndex.current/checkPoints.length,

				// },
			}
			console.log('passed tehe request body ',additionalData.current);
	
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
					console.log('got to results')
					//go to result page
					navigation.navigate('Results', { result });
				}
			} catch (error) {
				Alert.alert('Failure', 'Can not send answers');
			}		
		}

		const convertTemplatePointsToPath = (points) => {
			if (!points || points.length === 0) return '';

			let path = '';
			let started = false;

			for (let i = 0; i < points.length; i++) {
				const point = points[i];
				if (!point) continue;

				const x = point.x * width;
				const y = point.y * height;

				if (!started) {
					path += `M${x},${y} `;
					started = true;
				} else {
					path += `L${x},${y} `;
				}
			}

			return path.trim();
		};
		
		const convertPointsToPath = (points) => {
			if (points.length === 0) return '';  // Якщо немає точок, повертаємо порожній шлях
			// Розпочинаємо з першої точки
			const [start, ...rest] = points;
			// Створюємо команду M для початкової точки (перша точка)
			let result = `M${start.x},${start.y} `;
			// Додаємо команду L для кожної наступної точки (лінія до точки)
			result += rest.map(p => `L${p.x},${p.y}`).join(' ');
			return result;
		};
		
	return (
		<>
			{/* {round1Modal && (
				<RulesModal 
				visible={round1Modal} 
				rules='Round 1 rules: lorem ipsum' 
				onClose={() => {
					setRound1Modal(false);
				}} 
			/>
			)} */}
				<RulesModal 
				visible={round2Modal} 
				rules='Round 2 rules: lorem ipsum' 
				onClose={() => {
					setRound2Modal(false);
				}}/>
			
			

	

		<View
			style={styles.container}
			ref={viewRef}
		>
            

			<View>
			<Svg
				width={width}
				height={height}
				style={[styles.template, { borderWidth: 1, borderColor: 'red' }]}
			>
				<Path
					d={svgPathD}
					stroke="lightgray"
					strokeWidth={LINE_WIDTH}
					fill="none"
				/>
				{path.length > 0 && <Path d={convertPointsToPath(path)} stroke="black" strokeWidth={2} fill="none" />} 
			</Svg>
			</View>
			<GestureDetector gesture={panGesture}>
			<Animated.View
				ref={localRef}
				style={[
					{
						width: LINE_WIDTH/2,
						height: LINE_WIDTH/2,
						borderRadius: LINE_WIDTH/4,
						backgroundColor: 'red',
						position: 'absolute', // обов'язково, інакше translate не буде працювати правильно
						top: startMarkPos.y,
						left: startMarkPos.x,
						
					},
					animatedStyle, // підключаємо анімацію
				]}
			/>
			</GestureDetector>
			{checkPoints.map((point, index) => ( //debug
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


        </View>
	</>
		
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
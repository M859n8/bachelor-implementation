import React, { useRef, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions,Text, Modal, Button, UIManager, findNodeHandle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import RulesModal from '../../shared/RulesModal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


export default function LineTracking() {
	const [modalVisible, setModalVisible] = useState(true);
	const { width, height } = Dimensions.get('window');
	const [path, setPath] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const allStrokes = useSharedValue([]);
    const containerOffset = useRef({ x: 0, y: 0 });

	const [currentRound, setCurrentRound] = useState(1);
	const [round2Modal, setRound2Modal] = useState(false);

	const [userLines, setUserLines] = useState([])
	
	const viewRef = useRef(null);
	const [templatePoints, setTemplatePoints] = useState([])
	const navigation = useNavigation(); 
    // const zigzagPoints = [
	// 	 { x: 0.1, y: 0.1 },  // 10% ширини та 10% висоти
    //     { x: 0.5, y: 0.1 },  // 80% ширини та 10% висоти
    //     { x: 0.5, y: 0.5 },  // 80% ширини та 80% висоти
    //     { x: 0.1, y: 0.5 },
    // ];

	// const zigzagPath = "M1,71 L50,100 L150,200 L50,300 L150,400";
	// const spiralPath = `
	// 	M200,600        
	// 	Q200,400 250,600  
	// 	Q200,800 50,600
	// 	Q200,200 350,800
	// `;


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

	useEffect(() => {
		const template = generateTemplate();
		setTemplatePoints(template);
	}, []);
	

	const generateTemplate = () => {
		const spiral = generateArchimedeanSpiral();
		const zigzag = [
			{ x: 0.35, y: 0.65 },  // 10% ширини та 10% висоти
			{ x: 0.5, y: 0.35 },  // 80% ширини та 10% висоти
			{ x: 0.65, y: 0.65 },  // 80% ширини та 80% висоти
			{ x: 0.65, y: 0.55 },
			{ x: 0.75, y: 0.55 },  // 10% ширини та 10% висоти
			{ x: 0.75, y: 0.45 },  // 80% ширини та 10% висоти
			{ x: 0.85, y: 0.45 },  
			{ x: 0.85, y: 0.35 },
			{ x: 0.95, y: 0.35 },
			{ x: 0.95, y: 0.70 },
			{ x: 0.80, y: 0.70 },
			
		];
		const result = [...spiral, ...zigzag];
		// setTemplatePoints(result)

		return result;


	};

	

	
	// const zigzagPath = useMemo(() => {
	// 	if (zigzagPoints.length === 0) return '';
	// 	const [start, ...rest] = zigzagPoints;
	// 	return `M${start.x} ${start.y} ` + rest.map(p => `L${p.x} ${p.y}`).join(' ');
	// }, [zigzagPoints]);



	useEffect(() => {
		if (viewRef.current) {
			viewRef.current.measure((x, y, width, height, pageX, pageY) => {
				console.log('Measured:', { x: pageX, y: pageY, width, height });
				containerOffset.current = { x: pageX, y: pageY };
			});
		}

	}, []);
	



	const handleEndRound = () => {
		const newLine = normalizePath(path);
		if (currentRound === 1) {
			setUserLines(newLine)
			setPath([])
			// Завершився перший раунд, змінюємо на другий і показуємо модальне вікно з правилами
			setCurrentRound(2);
			setRound2Modal(true);  // Показуємо модальне вікно з правилами
		} else if (currentRound === 2) {
			console.log('got to if')
			// Завершився другий раунд, викликаємо функцію для відправки результатів на бекенд
			sendDataToBackend(newLine);
			// setCurrentRound(1);  // Повертаємось до першого раунду (або зупиняємо гру)
		}
	};

	const normalizePath = (path) => {
		
		return path.map(({ x, y }) => ({
			x: x / width,
			y: y / height,
		}));
	};
	
	

	const pathRef = useRef([]);

	const handleUpdate = (x, y) => {
		pathRef.current.push({ x, y });
		setPath([...pathRef.current]);
	};
	
	const handleEnd = () => {
		// allStrokes.value = [...allStrokes.value, [...pathRef.current]]; 
		// console.log('Stroke:', pathRef.current);
		// pathRef.current = [];
		setDrawing(false);
	};
	
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			// pathRef.current = [];
			// runOnJS(setPath)([]);
			// runOnJS(setDrawing)(true);
			// setPath([])
			// const x = e.absoluteX - containerOffset.current.x;
			// const y = e.absoluteY - containerOffset.current.y;
			const{x,y} = e

			// setPath((prevLines) => [
			// 	...prevLines,
			// 	[{ x, y }] 
			// ]);
			setPath([]);
			setDrawing(true)
		})
		.onUpdate((e) => {
			// const x = e.absoluteX - containerOffset.current.x;
			// const y = e.absoluteY - containerOffset.current.y;
			const{x,y} = e
			// runOnJS(handleUpdate)(x, y);
			// handleUpdate(x,y);
			// 
			console.log('🖊️ drawing:', x, y);
			setPath((prevPoints) => [...prevPoints, { x, y }]); 
		})
		.onEnd(() => {
			// runOnJS(handleEnd)();
			// handleEnd();
			// setDrawing(false);
			// console.log('path is : ',path)
			handleEndRound()

		})
		.runOnJS(true);

		const sendDataToBackend = async (data) => {
			console.log('got to send')

			// console.log('check userlins', userLines)

			// console.log('check data', data)
			// console.log('userLines isArray:', Array.isArray(userLines)); 
			// console.log('data isArray:', Array.isArray(data));
			
			requestBody = {
				userLines: [userLines, data],
				templateLines: templatePoints,
			}
			// console.log('request body', requestBody)
	
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
			// console.log('points are', points);
			if (points.length === 0) return '';  // Якщо немає точок, повертаємо порожній шлях
		
			// Розпочинаємо з першої точки
			const [start, ...rest] = points;
		
			// Створюємо команду M для початкової точки (перша точка)
			let result = `M${start.x},${start.y} `;
		
			// Додаємо команду L для кожної наступної точки (лінія до точки)
			result += rest.map(p => `L${p.x},${p.y}`).join(' ');
		
			// console.log('result', result);  // Перевіряємо, що шлях формується правильно
			return result;
		};
		
	return (
		<>
			<RulesModal 
				visible={round2Modal} 
				rules='Round 2 rules: lorem ipsum' 
				onClose={() => {
					setRound2Modal(false);

					// additionalData.current.timeStartRound2 = Date.now();
					// setTimerIsRunning(true);

				}} 
			/>

	

		<View
			style={styles.container}
			ref={viewRef}
			// onLayout={measureView}
		>
            <GestureDetector gesture={panGesture}>
				<View>
                {/* <Svg style={[StyleSheet.absoluteFill, styles.template]}> */}
				{/* <Svg style={[StyleSheet.absoluteFill, styles.template, { borderWidth: 1, borderColor: 'red' }]}> */}
				<Svg
					width={width}
					height={height}
					style={[styles.template, { borderWidth: 1, borderColor: 'red' }]}
				>

					<Path
						// d={convertTemplatePointsToPath(zigzagPoints)}
						d={convertTemplatePointsToPath(generateTemplate())}

						// d={spiralPath}
						stroke="lightgray"
						strokeWidth={20}
						fill="none"
					/>
                    {path.length > 0 && <Path d={convertPointsToPath(path)} stroke="black" strokeWidth={2} fill="none" />}
                </Svg>
				{/* <Svg width="500" height="500" viewBox="0 0 500 500">
					<Path d={ArchimedeanSpiral()} fill="none" stroke="black" strokeWidth="2" />
				</Svg> */}
				</View>
            </GestureDetector>
        </View>
	</>
		
	);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
		// backgroundColor: 'white',
		// alignItems: 'center',
		// justifyContent: 'center',



    },
	// template:{
	// 	position: 'absolute',

	// },
    infoBox: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 10,
        borderRadius: 10
    }
});
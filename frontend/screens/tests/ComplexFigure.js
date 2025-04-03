import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity, Image, Alert } from 'react-native';
import { useState } from 'react';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResultsModal from '../../shared/resultsModal.js';


const { width, height } = Dimensions.get('window');

export default function ComplexFigure() {
  	const [modalVisible, setModalVisible] = useState(true);
	const [resultsModal, setResultsModal] = useState(false);
	const [results, setResults] = useState({ finalScore: 100 });

	// const [pathData, setPathData] = useState([]);
	const [pathData, setPathData] = useState('');
	const [newLine, setNewLine] = useState(true);
	const [lines, setLines] = useState([]); // Масив для зберігання ліній
	// const [eraser, setEraser ] = useState(false);
	const [tool, setTool] = useState('pencil'); // 'pencil' або 'eraser'

	const [backgroundZoomed, setBackgroundZoomed] = useState(false); // Стан для контролю масштабу

	const paintGesture = Gesture.Pan()
		.onBegin((event) => {
			const { x , y } = event;
			setLines((prevLines) => [
			...prevLines,
			[{ x: x, y: y }] // Початкова точка для нової лінії
			]);
		})
		.onUpdate((event) => {
			const { x , y } = event;
			setLines((prevLines) => {
				const updatedLines = [...prevLines];
				const lastLine = updatedLines[updatedLines.length - 1];
				lastLine.push({ x: x, y: y }); // Додаємо нову точку до останньої лінії
				return updatedLines;
			});
		});
	
		// console.log('Array', pathData);
	const eraseGesture = Gesture.Pan()
	.onUpdate((event) => {
		const { x , y } = event;
		setLines((prevLines) =>
			prevLines.filter((line) => {
			// Перевіряємо кожну точку лінії на відстань до гумки
			return line.every(
				//тут повертаютсья всі точки крім видаленої з радіусом 10, 
				//але нам цей варіант не підходить, бо видаляючи крапку ми 
				// створюємо пробіл, але не додаємо початок нової лінії, який позначається М

				//на даний момент ця штука працює так, що видаляє цілу лінію і воно в принципі ок
				//але я не розумію чого воно так. розібратися з цим
				(point) => Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) > 10 //
			);
			})
		);
	});


	function generateSVGString() {
		console.log('got to generate string');
		
		return `
			<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" >
				${lines.map(line => {
					const path = line
						.map((point, i) => (i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`))
						.join(' ');
					return `<path d="${path}" stroke="black" stroke-width="2" fill="none"/>`;
				}).join('\n')}
			</svg>
		`;
	}

	async function sendToBackend() {
		console.log('got to send to backend');
		const svgString = generateSVGString();
		console.log('generated string', svgString);

        const token = await AsyncStorage.getItem('authToken');
		try{
			const response = await fetch('http://192.168.0.12:5000/api/result/figure/saveResponse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`

				},
				body: JSON.stringify({ svg: svgString })
			});

			
			console.log('send to the backend');
			if (response.ok) {
				// Alert.alert('Success', 'Your answers sent!');
				const data = await response.json();
				console.log('Server response:', data);
				setResults(response); 
				setResultsModal(true);
			}
		} catch (error) {
			Alert.alert('Failure', 'Can not send answers');
			console.log(error);
		}
		
	}

	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); // Перемикання стану для збільшення
	  };

  	return (  
		
	<GestureHandlerRootView style={styles.container}>
		{/* <View style={styles.exampleContainer}>
		<Image
                source={require("../../assets/complex_figure/figure.svg")}
                style={{width: 50,
                    height: 50,
                    position: "absolute",
                    resizeMode: "contain"}}
            />
		</View> */}
		{/* <ResultsModal 
			visible={resultsModal} 
			results={results} 
			onClose={() => setResultsModal(false)} 
		/> */}

		<View style={styles.buttonContainer}>
			<TouchableOpacity
				style={[styles.button, tool === 'pencil' && styles.activeButton]}
				onPress={() => setTool('pencil')}
			>
				<Icon name="edit-2" size={24} color={tool === 'pencil' ? 'white' : '#550080'} />
			</TouchableOpacity>

			{/* Кнопка гумки */}
			<TouchableOpacity
				style={[styles.button, tool === 'eraser' && styles.activeButton]}
				onPress={() => setTool('eraser')}
			>
				<Icon name="trash-2" size={24} color={tool === 'eraser' ? 'white' : '#550080'} />
			</TouchableOpacity>
		</View>
		{/* Зображення у правому верхньому куті */}
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
		
			<GestureDetector gesture={tool === 'pencil' ? paintGesture : eraseGesture}>


			<View style={styles.paintContainer}>
			<Svg style={{ flex: 1 }}>
				{lines.map((line, index) => {
					const path = line
					.map((point, i) => (i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`))
					.join(' ');

					return (
					<Path
						key={index}
						d={path}
						stroke="black"
						strokeWidth={2}
						fill="none"
					/>
					);
				})}
			</Svg>
			</View>
		</GestureDetector>
		<TouchableOpacity
			style={styles.button}
			onPress={() => sendToBackend()}
		>
			<Text style={{ color: '#550080', fontSize: 24 }}>Finish</Text>
		</TouchableOpacity>

	</GestureHandlerRootView>
  	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		
		
	},
	buttonContainer: {
		alignItems: 'space-between',
		flexDirection: 'row',
	},
	button: {
		backgroundColor: 'lightgray',
		padding: 12,
		margin: 12,
		borderRadius: 25,
	},
	activeButton: {
		backgroundColor: '#550080',
	},
	
	paintContainer: {
		// width: '70%',  // Ширина області малювання
		// height: '70%', // Висота області малювання
		width: 500,
		height: 500,
		backgroundColor: '#EABFFF', // Колір фону
		borderRadius: 10, // Закруглені кути
		borderWidth: 2,
		borderColor: '#000',
		// overflow: 'hidden', // Щоб лінії не виходили за межі
	},
	screenText: {
		fontSize: 24
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)'
	},
	modalText: {
		fontSize: 20,
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		textAlign: 'center'
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
});
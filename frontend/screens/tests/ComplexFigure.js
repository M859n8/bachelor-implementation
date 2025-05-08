// import 'react-native-gesture-handler';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity, Image, Alert } from 'react-native';
import { useState, useRef, useEffect} from 'react';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../shared/CustomButton.js';


// const { width, height } = Dimensions.get('window');

export default function ComplexFigure() {
	const navigation = useNavigation(); 

	const [isLoading, setIsLoading] = useState(false);

	const [lines, setLines] = useState([]); // Масив для зберігання ліній

	const [tool, setTool] = useState('pencil'); // 'pencil' або 'eraser'

	const [backgroundZoomed, setBackgroundZoomed] = useState(false); // Стан для контролю масштабу

	
	const paintGesture = Gesture.Pan()
		.onBegin((event) => {
			const { x, y } = event;
			setLines((prevLines) => [
				...prevLines,
				[{ x, y }] // Початкова точка для нової лінії
			]);
			
		})
		.onUpdate((event) => {
			const { x, y } = event;
			setLines((prevLines) => {
				const updatedLines = [...prevLines];
				const lastLine = updatedLines[updatedLines.length - 1];
				lastLine.push({ x: x, y: y }); // Додаємо нову точку до останньої лінії
				return updatedLines;
			});
		})
		.onEnd(() => {
			
		})
		.runOnJS(true);
	
	const eraseGesture = Gesture.Pan()
		.onUpdate((event) => {
			const { x , y } = event;
			setLines((prevLines) =>
				prevLines.filter((line) => { //проходить по кожній лінії та залишає тільки ті, які не торкається гумка.

				// Перевіряємо кожну точку лінії на відстань до гумки
				return line.every( //Якщо усі точки лінії знаходяться далі ніж 10px від гумки (x, y), ця лінія залишається.
					(point) => Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) > 10 //
				);
				})
			);
		})
		.runOnJS(true);



	function generateSVGString() {
		
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
		const svgString = generateSVGString();
		setIsLoading(true)
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

			const result = await response.json();
			
			if (response.ok) {
				navigation.navigate('Results', { result });

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
	
		<View style={styles.buttonContainer}>
			<TouchableOpacity //pencil button
				style={[styles.button, tool === 'pencil' && styles.activeButton]}
				onPress={() => setTool('pencil')}
			>
				<Icon name="edit-2" size={24} color={tool === 'pencil' ? 'white' : '#4CAF50'} />
			</TouchableOpacity>

			<TouchableOpacity //eraser button
				style={[styles.button, tool === 'eraser' && styles.activeButton]}
				onPress={() => setTool('eraser')}
			>
				<Icon name="trash-2" size={24} color={tool === 'eraser' ? 'white' : '#4CAF50'} />
			</TouchableOpacity>
		</View>
		<TouchableOpacity  //template
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
	
		<CustomButton
			title="Send"
			onPress={() => sendToBackend()}
			isLoading={isLoading}
		/>

	</GestureHandlerRootView>
  	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff'
	},
	buttonContainer: {
		alignItems: 'space-between',
		flexDirection: 'row',
		gap: 20,
		// marginVertical: 20,
	},
	button: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4, // Android тінь
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},

	activeButton: {
		backgroundColor: '#4CAF50',
	},
	
	paintContainer: {
		// width: '70%',  // Ширина області малювання
		// height: '70%', // Висота області малювання
		width: 500,
		height: 500,
		backgroundColor: '#C4E3D7', // Колір фону
		borderRadius: 10, // Закруглені кути
		// borderWidth: 2,
		// borderColor: '#000',
		margin: 20,
		// overflow: 'hidden', // Щоб лінії не виходили за межі
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
		borderColor: '#ccc',
		borderWidth: 2,
	  },
	  zoomedImage: {
		width: 500, // Збільшений розмір
		height: 500,
		
		borderRadius: 5,
		borderColor: '#ccc',
		borderWidth: 2,
		zIndex: 1,
	  },
});
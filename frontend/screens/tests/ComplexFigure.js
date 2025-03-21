import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

export default function ComplexFigure({route}) {
  	const [modalVisible, setModalVisible] = useState(true);
	// const [pathData, setPathData] = useState([]);
	const [pathData, setPathData] = useState('');
	const [newLine, setNewLine] = useState(true);
	const [lines, setLines] = useState([]); // Масив для зберігання ліній
	// const [eraser, setEraser ] = useState(false);
	const [tool, setTool] = useState('pencil'); // 'pencil' або 'eraser'



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

  	return (  
		
	<GestureHandlerRootView style={styles.container}>
		<View style={styles.exampleContainer}>
			<TouchableOpacity
				style={[styles.button, tool === 'pencil' && styles.activeButton]}
				onPress={() => setTool('pencil')}
			>
				<Icon name="edit-2" size={24} color={tool === 'pencil' ? 'white' : 'black'} />
			</TouchableOpacity>

			{/* Кнопка гумки */}
			<TouchableOpacity
				style={[styles.button, tool === 'eraser' && styles.activeButton]}
				onPress={() => setTool('eraser')}
			>
				<Icon name="plus" size={24} color={tool === 'eraser' ? 'white' : 'black'} />
			</TouchableOpacity>
		</View>
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

	</GestureHandlerRootView>
  	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		
	},
	button: {
		backgroundColor: 'lightgray',
		padding: 12,
		borderRadius: 8,
	},
	activeButton: {
		backgroundColor: 'blue',
	},
	exampleContainer: {

	},
	paintContainer: {
		width: '70%',  // Ширина області малювання
		height: '70%', // Висота області малювання
		backgroundColor: 'pink', // Колір фону
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
	}
});
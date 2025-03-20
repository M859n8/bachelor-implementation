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

	// const [eraser, setEraser ] = useState(false);
	const [tool, setTool] = useState('pencil'); // 'pencil' або 'eraser'



	const gesture = Gesture.Pan()
		.onBegin((event) => {
			// Починаємо нову лінію з M (Move To)
            const { x, y } = event;
            setPathData(prevPath => `${prevPath} M${x},${y}`);
			setNewLine(false);

		})
		.onUpdate((event) => {
			const { x, y } = event;
            setPathData(prevPath => `${prevPath} L${x},${y}`);
			// console.log(`Moved by: ${event.translationX}, ${event.translationY}`);
		})
		.onEnd(() => {
			setNewLine(true);
			console.log('Gesture ended');
		});
	
		// console.log('Array', pathData);

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
				<Icon name="eraser" size={24} color={tool === 'eraser' ? 'white' : 'black'} />
			</TouchableOpacity>
		</View>
		<GestureDetector gesture={gesture}  >
		{/* <GestureDetector tool === 'pencil' ? gesture={paintGesture} : gesture={eraseGesture} > */}

			<View style={styles.paintContainer}>
			<Svg style={{ flex: 1 }}>
				<Path
				d={pathData}
				stroke="black"
				strokeWidth={2}
				fill="none"
				/>
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
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import { useState} from 'react';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../shared/CustomButton.js';
import RulesModal from '../../shared/RulesModal.js';

import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';
import {sendRequest} from '../../shared/sendRequest.js';

export default function ComplexFigure() {
	const navigation = useNavigation(); //using for navigation to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //using for updating auth flag based on server response

	const [rulesModal, setRulesModal] = useState(true); //rules at the start of the game


	const [isLoading, setIsLoading] = useState(false);//loading status for end test button

	const [lines, setLines] = useState([]); //array for lines
	const [tool, setTool] = useState('pencil'); //active tool: 'pencil' or 'eraser'

	const [backgroundZoomed, setBackgroundZoomed] = useState(false); //control template zoom

	//gesture for pencil painting
	const paintGesture = Gesture.Pan()
		.onBegin((event) => {
			const { x, y } = event;
			setLines((prevLines) => [
				...prevLines,
				[{ x, y }] //set start point 
			]);
			
		})
		.onUpdate((event) => {
			const { x, y } = event;
			setLines((prevLines) => {
				const updatedLines = [...prevLines];
				const lastLine = updatedLines[updatedLines.length - 1]; //get last array
				lastLine.push({ x: x, y: y }); //add points to the last array (last line)
				return updatedLines;
			});
		})
		.runOnJS(true); //run on js thread so i can freely use js functions
	
	//gesture for erasor
	const eraseGesture = Gesture.Pan()
		.onUpdate((event) => {
			const { x , y } = event;
			setLines((prevLines) =>
				//goes through lines and leaves only those that are not touched by the eraser
				prevLines.filter((line) => {

				//check each line point 
				return line.every(
					(point) => Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) > 10 //
				);
				})
			);
		})
		.runOnJS(true);


	//generate svg
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

	//handle `end test` button click and send data to the backend
	async function sendToBackend() {
		const svgString = generateSVGString();
		setIsLoading(true); //upd loading state of the button
		await sendRequest({
			url: 'http://192.168.0.12:5000/api/result/figure/saveResponse',
			body: {svg: svgString},
			setIsAuthenticated,
			navigation,
			onSuccess: result => navigation.navigate('Results', { result })
		});
     
		
	}

	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); //increase template size
	  };

  	return (  
	<>	
	<RulesModal 
		visible={rulesModal} 
		rules='Recreate the drawing according to the given template. The template increases in size by clicking. You have drawing and erasing available. When the drawing is completed, click the end test button.' 
		onClose={() => {
			setRulesModal(false);

		}} 
	/>
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
			source={require("../../assets/complex_figure/complexFigure.png")} 
			style={[styles.image, backgroundZoomed ? styles.zoomedImage : {}]} 
 			resizeMode="contain"
			/>

		</TouchableOpacity>
		
			<GestureDetector gesture={tool === 'pencil' ? paintGesture : eraseGesture}>

				<View style={styles.paintContainer}>
				<Svg style={{ flex: 1 }}>
					{lines.map((line, index) => {
						const path = line
						//dynamicly create line. first point with the tag 'M' and others with 'L'
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
			title="End test"
			onPress={() => sendToBackend()}
			isLoading={isLoading}
		/>

	</GestureHandlerRootView>
	</>
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
	},
	button: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4, // Android shadow
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},

	activeButton: {
		backgroundColor: '#4CAF50',
	},
	
	paintContainer: {
		width: 500,
		height: 500,
		backgroundColor: '#C4E3D7', 
		borderRadius: 10, 
		margin: 20,
	},
	imageContainer: {
		backgroundColor: 'white',
		zIndex: 10, 
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 5,
		borderColor: '#ccc',
		borderWidth: 2,
	},
	zoomedImage: {
		width: 500, 
		height: 500,
		
		borderRadius: 5,
		borderColor: '#ccc',
		borderWidth: 2,
		zIndex: 1,
	},
});
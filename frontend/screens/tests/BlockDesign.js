import React from 'react';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity, Image, Alert } from 'react-native';
import { useState } from 'react';
import {useSharedValue, useAnimatedRef} from 'react-native-reanimated';
import { Gesture, GestureHandlerRootView, GestureDetector } from 'react-native-gesture-handler';
import Block from '../../shared/Block.js';
import Grid from '../../shared/Grid.js';


export default function BlockDesign() {
	const [backgroundZoomed, setBackgroundZoomed] = useState(false);
	const handleImagePress = () => {
		setBackgroundZoomed(!backgroundZoomed); // Перемикання стану для збільшення
	};
	const [blocks, setBlocks] = useState([
		{ id: 1, row: 0, col: 0 },
		{ id: 2, row: 1, col: 1 },
		{ id: 3, row: 2, col: 2 },
	]);
	const gridLayout = useSharedValue({ x: 0, y: 0 });
	// const blockRef = useAnimatedRef();

	// const blockLayout = useSharedValue([{ x: 0, y: 0 }, { x: 0, y: 0 } , { x: 0, y: 0 }, { x: 0, y: 0 } ,]);


  return (
    <View style={styles.container}>
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
		<View
			style={{ width: '45%', aspectRatio: 1,  }}
			onLayout={(event) => {
				const { x, y, width, height } = event.nativeEvent.layout;
				console.log('Grid layout:', x, y, width, height);
				gridLayout.value = { x, y };
				// console.log('Value grid layout:', gridLayout.value);

			}}
		>
			<Grid/>
		</View>
		{/* <View
			onLayout={(event) => {
				const { x, y } = event.nativeEvent.layout;
				console.log('Block is at', x, y);
				gridLayout.value = { x, y };

			}}
		> */}
			{blocks.map((block) => (
				<Block key={block.id} blockId={block.id} gridPosition={gridLayout}/>

			))}
		{/* </View> */}


		

	</View>
  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
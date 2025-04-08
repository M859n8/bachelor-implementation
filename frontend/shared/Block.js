import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState, useRef, useEffect } from 'react';

import Animated from 'react-native-reanimated';
import {
	useSharedValue,useAnimatedStyle,withSpring,
	withTiming,runOnJS,useAnimatedRef, measure, runOnUI, getRelativeCoords 
  } from 'react-native-reanimated';
import { StyleSheet, Dimensions, View } from 'react-native';


export default function Block({ blockId, gridPosition, refCallback, setBlocks, updateBlockValue }) {
	const isPressed = useSharedValue(false);
	const offset = useSharedValue({ x: 0, y: 0 });
	const color = useSharedValue('red');
	const colors = ['white', 'mixed1', 'red'];
	const colorIndex = useSharedValue(0);
	const rotation = useSharedValue(0);

	// const blockRef = useRef(null);
	// const blockRef = useAnimatedRef();

	const blockLayout = useSharedValue({ x: 0, y: 0 });
	const localRef = useRef(null);

	useEffect(() => {
		if (refCallback) {
			refCallback(localRef.current);
		}
	}, [refCallback]);


	const animatedStyles = useAnimatedStyle(() => {
	
		return {
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
			{ rotate: `${rotation.value}deg` },
			{ scale: withSpring(isPressed.value ? 1.01 : 1) },
		],
		backgroundColor: colors[colorIndex.value] === 'mixed1' ? 'red' : colors[colorIndex.value],
		// backgroundColor: colors[colorIndex.value] === 'mixed1' ? 'red' : colors[colorIndex.value] === 'mixed2' ? 'white' : colors[colorIndex.value],

		};
  	});
	const innerAnimatedStyles = useAnimatedStyle(() => {
		// console.log('Current color index:', colorIndex.value);  // Перевіряємо поточне значення індексу
   		// console.log('Color at this index:', colors[colorIndex.value]);
		return {
			backgroundColor: colors[colorIndex.value] === 'red'  ? 'red' : 'white', // Змінюється тільки коли квадрат червоний
			// backgroundColor: (colors[colorIndex.value] === 'red' || colors[colorIndex.value] === 'mixed2') ? 'red' : 'white',

		};

	});

	const updateBlockColor = (newColor) => {
		setBlocks((prevBlocks) => {
			const updatedBlock = {
				...prevBlocks[blockId],
				color: newColor,
			};
			return [
				...prevBlocks.slice(0, blockId),
				updatedBlock,
				...prevBlocks.slice(blockId + 1)
			];
		});
	};
	// const updateBlockValue = (newValue, type) => {
	// 	setBlocks((prevBlocks) => {
	// 		const updatedBlock = {
	// 			...prevBlocks[blockId],
	// 			[type]: newValue,
	// 		};
	// 		return [
	// 			...prevBlocks.slice(0, blockId),
	// 			updatedBlock,
	// 			...prevBlocks.slice(blockId + 1)
	// 		];
	// 	});
	// };
	const updateBlockRotation = (newRotation) => {
		setBlocks((prevBlocks) => {
			const updatedBlock = {
				...prevBlocks[blockId],
				rotation: newRotation,
			};
			return [
				...prevBlocks.slice(0, blockId),
				updatedBlock,
				...prevBlocks.slice(blockId + 1)
			];
		});
	};
	

	const tapGesture = Gesture.Tap()
		.onEnd(() => {
			colorIndex.value = (colorIndex.value + 1) % colors.length;
			// console.log('Updated colorIndex:', colorIndex.value);
			// runOnJS(updateBlockColor)(colors[colorIndex.value]);
			runOnJS(updateBlockValue)(colors[colorIndex.value], 'color', blockId);

			
		});
	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			const newRotation = rotation.value + 45;
			rotation.value = withTiming(newRotation, { duration: 100 });
			// runOnJS(updateBlockRotation)(newRotation);
			runOnJS(updateBlockValue)(newRotation, 'rotation', blockId);

		});

	const start = useSharedValue({ x: 0, y: 0 });
	const panGesture = Gesture.Pan()
		.onBegin(() => {
			isPressed.value = true;
			// runOnJS(measureBlock)();

		})
		.onUpdate((e) => {
			offset.value = {
				x: e.translationX + start.value.x,
				y: e.translationY + start.value.y,
			};
		})
		.onEnd((e) => {
			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			isPressed.value = false;
		

		})
		// .onFinalize(() => {
		// 	isPressed.value = false;
		// 	// identifyCell()

		// });
	
	// allows both gestures to work together
	// Дабл-тап має вищий пріоритет
	const tapGestures = Gesture.Exclusive(doubleTapGesture, tapGesture);

	const gesture = Gesture.Simultaneous(tapGestures, panGesture);

	return (
		<View >

		<GestureDetector gesture={gesture}>
			<Animated.View  ref={localRef} style={[styles.square, animatedStyles]} >
				<Animated.View style={[styles.whiteHalf, innerAnimatedStyles]} />
			</Animated.View>
			
		</GestureDetector>
		<View style={styles.dot}/>

		</View>

	);
	}


	  

const styles = StyleSheet.create({
	square: {
	//   width: '15vh',
	//   height: '15vh',
		width: '15%',
		height: 'auto',
    	aspectRatio: 1, //square
		backgroundColor: 'white',
		alignSelf: 'center',
		position: 'absolute', //позиція абсолют, щоб болк рухався фактично, а не тільки в леєрі уі
		zIndex: 1, 
		top:0,
		left: 0,
		overflow: 'hidden'
	},
	whiteHalf: {
		position: 'absolute',
		width: '170%',
		height: 'auto',
    	aspectRatio: 1,
		backgroundColor: 'white',
		transform: [{ rotate: '-45deg' }],
		top: '25%',
		left: '25%',
	},
	dot: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'green',
		position: 'absolute',
		top: 220,
		left: 399,

	  }
});

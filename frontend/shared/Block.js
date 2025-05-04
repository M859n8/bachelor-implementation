import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState, useRef, useEffect } from 'react';

import Animated from 'react-native-reanimated';
import {
	useSharedValue,useAnimatedStyle,withSpring,
	withTiming,runOnJS,useAnimatedRef, measure, runOnUI, getRelativeCoords 
  } from 'react-native-reanimated';
import { StyleSheet, Dimensions, View } from 'react-native';
import debounce from 'lodash.debounce';
import { useCallback } from 'react';

export default function Block({ blockId, gridPosition, updateBlockValue, blockSize, cellSize }) {
	const isPressed = useSharedValue(false); //я його не використовую, воно типу само створилося 
	const offset = useSharedValue({ x: 0, y: 0 }); //current block position during drag

	const colors = ['white', 'mixed', 'red'];
	const colorIndex = useSharedValue(0);
	const rotation = useSharedValue(0);

	const localRef = useRef(null); //ref to the block , for position measurement


	//calculate row and col at the end of the movement
	const checkBlockPosition = (relativeX, relativeY) =>{
		const col = Math.round(relativeX / cellSize);
		const row = Math.round(relativeY / cellSize);
				
		updateBlockValue({ row: row, col: col }, 'position', blockId);
	}

	//debounce function for identificating series of gestures
	const debouncedActionEnd = useCallback(
		debounce(() => {
			// console.log('Серія жестів завершена', blockId);
			updateBlockValue(0, 'changesCount', blockId);
		}, 1700),
		[] // дуже важливо: залежності порожні, щоб debounce не створювався заново
	);

	//animation for whole square 
	const animatedStyles = useAnimatedStyle(() => {
		return {
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
			{ rotate: `${rotation.value}deg` },
			{ scale: withSpring(isPressed.value ? 0.95 : 1) },
		],
		backgroundColor: colors[colorIndex.value] === 'mixed' ? 'red' : colors[colorIndex.value],

		};
  	});
	//for inner half of the square
	const innerAnimatedStyles = useAnimatedStyle(() => {
		return {
			backgroundColor: colors[colorIndex.value] === 'red'  ? 'red' : 'white', // Змінюється тільки коли квадрат червоний

		};

	});

	
	const tapGesture = Gesture.Tap()
		.onEnd(() => {

			const newIndex = (colorIndex.value + 1) % colors.length;
			colorIndex.value = newIndex;
			updateBlockValue(colors[newIndex], 'color', blockId);

			debouncedActionEnd();
		})
		.runOnJS(true);

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			const newRotation = (rotation.value + 45) % 360;
			rotation.value = withTiming(newRotation, { duration: 100 });
			updateBlockValue(newRotation, 'rotation', blockId);
			debouncedActionEnd();

		})
		.runOnJS(true);

	const start = useSharedValue({ x: 0, y: 0 }); //block position after last move
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			isPressed.value = true;
			debouncedActionEnd();
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
			let blockLayout;

			if (localRef.current) {
				localRef.current.measure((x, y, width, height, pageX, pageY) => {
					blockLayout = { //get block actual pos on screen
						x: pageX,
						y: pageY,
					};

				});
			}

			//calculate pos relative to grid
			const relativeX =  blockLayout.x-gridPosition.value.x;
			const relativeY = blockLayout.y-gridPosition.value.y
			// console.log('block layout', blockLayout.x, blockLayout.y, 'grif position', gridPosition.value.x, gridPosition.value.y)

			checkBlockPosition(relativeX, relativeY) //calculate cell and row
			debouncedActionEnd();

		})
		.runOnJS(true);

		// Дабл-тап має вищий пріоритет
	const tapGestures = Gesture.Exclusive(doubleTapGesture, tapGesture);

	const gesture = Gesture.Simultaneous(tapGestures, panGesture);

	return (
		<View >

		<GestureDetector gesture={gesture}>
			<Animated.View  ref={localRef} style={[styles.square, animatedStyles, {width: blockSize, height: blockSize}]} >
				<Animated.View style={[styles.whiteHalf, innerAnimatedStyles]} />
			</Animated.View>
			
		</GestureDetector>
		{/* <View style={styles.dot}/> */}

		</View>

	);
	}


	  

const styles = StyleSheet.create({
	square: {
	//   width: 150,
	//   height: 150,
		// width: blockSize,
		// height: blockSize,
    	// aspectRatio: 1, //square
		backgroundColor: 'white',
		alignSelf: 'center',
		// position: 'absolute', //позиція абсолют, щоб болк рухався фактично, а не тільки в леєрі уі
		zIndex: 1, 
		// top:0,
		// left: 0,
		overflow: 'hidden'
	},
	whiteHalf: {
		position: 'absolute',
		width: '150%',
		height: 'auto',
    	aspectRatio: 1,
		backgroundColor: 'white',
		transform: [{ rotate: '-45deg' }],
		top: '28%',
		left: '28%',
	},
	dot: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'green',
		position: 'absolute',
		top: 281,
		left: 9,

	  }
});

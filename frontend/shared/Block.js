import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState, useRef, useEffect } from 'react';

import Animated from 'react-native-reanimated';
import {
	useSharedValue,useAnimatedStyle,withSpring,
	withTiming,runOnJS,useAnimatedRef, measure, runOnUI
  } from 'react-native-reanimated';
import { StyleSheet, Dimensions, View } from 'react-native';


export default function Block({ blockId, gridPosition }) {
	const isPressed = useSharedValue(false);
	const offset = useSharedValue({ x: 0, y: 0 });
	const color = useSharedValue('red');
	const colors = ['white', 'mixed', 'red'];
	const colorIndex = useSharedValue(0);
	const rotation = useSharedValue(0);

	// const blockRef = useRef(null);
	const blockRef = useAnimatedRef();

	const blockLayout = useSharedValue({ x: 0, y: 0 });


	const animatedStyles = useAnimatedStyle(() => {
		return {
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
			{ rotate: `${rotation.value}deg` },
			{ scale: withSpring(isPressed.value ? 1.01 : 1) },
		],
		backgroundColor: colors[colorIndex.value] === 'mixed' ? 'red' : colors[colorIndex.value],
		};
  	});
	const innerAnimatedStyles = useAnimatedStyle(() => {
		// console.log('Current color index:', colorIndex.value);  // Перевіряємо поточне значення індексу
   		// console.log('Color at this index:', colors[colorIndex.value]);
		return {
			backgroundColor: colors[colorIndex.value] === 'red' ? 'red' : 'white', // Змінюється тільки коли квадрат червоний
			
		};

	});
	const identifyCell = (blockPosition) => {
		// console.log('identify cell')
		const relativeX = blockPosition.x + blockLayout.value.x - gridPosition.value.x;
		const relativeY = blockPosition.y + blockLayout.value.y - gridPosition.value.y;

		console.log('grid position ', gridPosition.value, 'current block position', blockPosition)
		console.log(`relative position {${relativeX},${relativeY}}`)
		const screenWidth = Dimensions.get("window").width;

		const gridWidth = screenWidth * 0.45; // або скільки % займає твоя сітка
		const cellSize = gridWidth / 3;

		const col = relativeX / cellSize;
		const row = relativeY / cellSize;
		console.log('row is ', row, ' column is', col)
		return { row, col };


	}
	const measureBlock = () => {
		blockRef.current?.measure((fx, fy, width, height, px, py) => {
			console.log('Absolute X:', px, 'Y:', py);
			blockLayout.value = { x : px, y : py };

			// identifyCell({ x: px, y: py }); // викликаємо функцію визначення клітинки
		});
	};
	// useEffect(() => {
	// 	console.log('Absolute X:', px, 'Y:', py);
		
	// }, [blockRef]); 

	const tapGesture = Gesture.Tap()
		.onEnd(() => {
			colorIndex.value = (colorIndex.value + 1) % colors.length;
			// console.log('Updated colorIndex:', colorIndex.value);

		});
	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2) // Дабл-тап
		.onEnd(() => {
			rotation.value = withTiming(rotation.value + 45, { duration: 200 }); // Обертання на 45°
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
		.onEnd(() => {
			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			isPressed.value = false;
			console.log('zero')
			// runOnJS(measureBlock)();
			runOnUI(() => {
				const measured = measure(blockRef);
				if (measured) {
					const { x, y, width, height, pageX, pageY } = measured;
					console.log('Absolute X:', pageX, 'Y:', pageY, 'and in elem coords ', x, 'and', y);
					
					// runOnJS(identifyCell)({ x: pageX, y: pageY });
				}
			})();
			// runOnJS(identifyCell)(start.value);
			// start.value = {x:-115, y:-342}
			// runOnJS(why)();

		})
		// .onFinalize(() => {
		// 	isPressed.value = false;
		// 	// identifyCell()

		// });
	


	// allows both gestures to work together
	const gesture = Gesture.Simultaneous(tapGesture, panGesture, doubleTapGesture);
	return (
		// <View ref={blockRef}>

		<GestureDetector gesture={gesture}>
			<Animated.View  ref={blockRef} style={[styles.square, animatedStyles]} >
				<Animated.View style={[styles.whiteHalf, innerAnimatedStyles]} />
			</Animated.View>
			
		</GestureDetector>
		// </View>

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
});

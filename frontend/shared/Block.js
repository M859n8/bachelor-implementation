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

export default function Block({ blockId, gridPosition, refCallback, setBlocks, updateBlockValue, blockSize, cellSize }) {
	const isPressed = useSharedValue(false);
	const offset = useSharedValue({ x: 0, y: 0 });
	// const color = useSharedValue('red');
	const colors = ['white', 'mixed', 'red'];
	const colorIndex = useSharedValue(0);
	const rotation = useSharedValue(0);
	// const positionRef = useRef({ row: 0, col: 0 });


	const [previousStates, setPreviousStates] = useState({});

	const blockLayout = useSharedValue({ x: 0, y: 0 });
	const localRef = useRef(null);
	// useEffect(() => {
	// 	if (localRef.current) {
	// 		localRef.current.measure((x, y, width, height, pageX, pageY) => {
	// 			console.log('Координати блоку:', { pageX, pageY, width, height });
	// 			blockLayout.value = { x: pageX, y: pageY };
	// 		});
	// 	}
	// }, [isPressed]);
	useEffect(() => {
		if (refCallback) {
			refCallback(localRef.current);
		}
	}, [refCallback]);

	const checkBlockPosition = (relativeX, relativeY) =>{
		const col = Math.round(relativeX / cellSize);
		const row = Math.round(relativeY / cellSize);

		console.log(`Блок ${blockId} — Рядок ${row}, Колонка ${col}`);
				
		// positionRef.current= { row: row, col: col };
		updateBlockValue({ row: row, col: col }, 'position', blockId);
	}

	// const comparePositions =()=>{
	// 	const newState = {
	// 		position: currentPos, // наприклад, { x, y }
	// 		rotation: rotation,
	// 		color: colorIndex,
	// 	};
	
	// 	const prev = previousStates[blockId];

	// let actionEndTimeout;

	// const resetActionSeriesTimer = () => {
	// 	clearTimeout(actionEndTimeout);
	// 	actionEndTimeout = setTimeout(() => {
	// 		updateBlockValue(0, 'changesCount', blockId);
	// 		console.log('End of gesture series');
	// 	}, 2000); // або будь-який інший час очікування
	// };
	const debouncedActionEnd = useCallback(
		debounce(() => {
			console.log('Серія жестів завершена');
			updateBlockValue(0, 'changesCount', blockId);
		}, 1500),
		[] // дуже важливо: залежності порожні, щоб debounce не створювався заново
	);

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
	const innerAnimatedStyles = useAnimatedStyle(() => {
		// console.log('Current color index:', colorIndex.value);  // Перевіряємо поточне значення індексу
   		// console.log('Color at this index:', colors[colorIndex.value]);
		return {
			backgroundColor: colors[colorIndex.value] === 'red'  ? 'red' : 'white', // Змінюється тільки коли квадрат червоний
			// backgroundColor: (colors[colorIndex.value] === 'red' || colors[colorIndex.value] === 'mixed2') ? 'red' : 'white',

		};

	});

	
	

	const tapGesture = Gesture.Tap()
		.onEnd(() => {

			const newIndex = (colorIndex.value + 1) % colors.length;
			colorIndex.value = newIndex;
			// runOnJS(updateBlockColor)(colors[colorIndex.value]);
			updateBlockValue(colors[newIndex], 'color', blockId);

			debouncedActionEnd();
			// resetActionSeriesTimer();
		})
		.runOnJS(true);

	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			const newRotation = (rotation.value + 45) % 360;
			rotation.value = withTiming(newRotation, { duration: 100 });
			// runOnJS(updateBlockRotation)(newRotation);

			updateBlockValue(newRotation, 'rotation', blockId);
			debouncedActionEnd();
			// resetActionSeriesTimer();
			

		})
		.runOnJS(true);

	const start = useSharedValue({ x: 0, y: 0 });
	const touchOffset = useSharedValue({ x: 0, y: 0 }); // різниця між торком і верхнім лівим кутом
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
			let blockTopLeft;

			if (localRef.current) {
				localRef.current.measure((x, y, width, height, pageX, pageY) => {
					// console.log('Координати блоку:', { pageX, pageY, width, height });
					blockLayout.value = { x: pageX, y: pageY };
					blockTopLeft = {
						x: pageX,
						y: pageY,
					};
					// console.log('This position calculation ', touchOffset.value.x,  e.absoluteX - pageX)

				});
			}
			const relativeX =  blockTopLeft.x-gridPosition.value.x;
			const relativeY = blockTopLeft.y-gridPosition.value.y


			checkBlockPosition(relativeX, relativeY)
			// const blockCenter = {
			// 	x: e.absoluteX - touchOffset.value.x + blockWidth / 2,
			// 	y: e.absoluteY - touchOffset.value.y + blockHeight / 2,
			// };
			debouncedActionEnd();
			// resetActionSeriesTimer();

		

		})
		.runOnJS(true);
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

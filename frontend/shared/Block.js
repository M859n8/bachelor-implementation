/**
 * Author: Maryna Kucher
 * Description: Block component for the Block Design Test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {
	useSharedValue,useAnimatedStyle,withSpring,
	withTiming,runOnJS,useAnimatedRef, measure, runOnUI,
  } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import debounce from 'lodash.debounce';
import { useCallback } from 'react';


export default function Block({ blockId, gridPosition, updateBlockValue, blockSize, cellSize }) {
	const isPressed = useSharedValue(false); 
	const offset = useSharedValue({ x: 0, y: 0 }); //current block position during drag

	const colors = ['white', 'mixed', 'red']; //possible collors 
	const colorIndex = useSharedValue(0); //current color
	const rotation = useSharedValue(0); //current rotation

	const localRef = useAnimatedRef(); //for measuring block position

	//calculate row and col at the end of the movement
	const checkBlockPosition = (relativeX, relativeY) =>{
		const col = Math.round(relativeX / cellSize);
		const row = Math.round(relativeY / cellSize);
				
		updateBlockValue({ row: row, col: col }, 'position', blockId);
	}

	//debounce function for identificating series of gestures
	const debouncedActionEnd = useCallback(
		debounce(() => {
			updateBlockValue(0, 'changesCount', blockId);
		}, 1700),
		[] 
	);

	//animation for whole block 
	const animatedStyles = useAnimatedStyle(() => {
		return {
		transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
			{ rotate: `${rotation.value}deg` },
			{ scale: withSpring(isPressed.value ? 0.95 : 1) }, //change scale during movement
		],
		backgroundColor: colors[colorIndex.value] === 'mixed' ? 'red' : colors[colorIndex.value],

		};
  	});
	//styles for inner half of the block
	const innerAnimatedStyles = useAnimatedStyle(() => {
		return {
			//changes only for a whole red square
			backgroundColor: colors[colorIndex.value] === 'red'  ? 'red' : 'white', 

		};

	});

	//tap gesture for color change
	const tapGesture = Gesture.Tap()
		.onEnd(() => {
			//get new color index
			const newIndex = (colorIndex.value + 1) % colors.length;
			colorIndex.value = newIndex;
			//update block state
			updateBlockValue(colors[newIndex], 'color', blockId);

			debouncedActionEnd();
		})
		.runOnJS(true); //allows me to call JS functions from animation

	//gesture for angle change
	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.onEnd(() => {
			const newRotation = (rotation.value + 45) % 360;
			rotation.value = withTiming(newRotation, { duration: 100 });
			//update block state
			updateBlockValue(newRotation, 'rotation', blockId);
			debouncedActionEnd();

		})
		.runOnJS(true);

	const start = useSharedValue({ x: 0, y: 0 }); //block position on start of the move
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			isPressed.value = true;
			debouncedActionEnd(); //reset the action counter
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
			runOnUI(() => { //measure current block pos to compare it with grid
				const layout = measure(localRef);
				if (layout) {
					const relativeX = layout.pageX - gridPosition.value.x;
					const relativeY = layout.pageY - gridPosition.value.y;
		
					// call js functions on js thread
					runOnJS(checkBlockPosition)(relativeX, relativeY);
				}
			})();
			//reset the action timer
			debouncedActionEnd();

		})
		.runOnJS(true);

	// Double tap has higher priority
	const tapGestures = Gesture.Exclusive(doubleTapGesture, tapGesture);

	const gesture = Gesture.Simultaneous(tapGestures, panGesture);

	return (
		<View >

			<GestureDetector gesture={gesture}>
				<Animated.View  ref={localRef} style={[styles.square, animatedStyles, {width: blockSize, height: blockSize}]} >
					<Animated.View style={[styles.whiteHalf, innerAnimatedStyles]} />
				</Animated.View>
				
			</GestureDetector>

		</View>

	);
	}


	  

const styles = StyleSheet.create({
	square: {
		backgroundColor: 'white',
		alignSelf: 'center',
		borderWidth: 1,
		borderColor: '#ddd', 
		zIndex: 1,
		overflow: 'hidden',
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
	
});

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
  } from 'react-native-reanimated';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity, Image, Alert } from 'react-native';


export default function Block() {
	const isPressed = useSharedValue(false);
	const offset = useSharedValue({ x: 0, y: 0 });
	const color = useSharedValue('red');
	const colors = ['white', 'mixed', 'red'];
	const colorIndex = useSharedValue(0);
	const rotation = useSharedValue(0);

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
		console.log('Current color index:', colorIndex.value);  // Перевіряємо поточне значення індексу
   		console.log('Color at this index:', colors[colorIndex.value]);
		return {
			backgroundColor: colors[colorIndex.value] === 'red' ? 'red' : 'white', // Змінюється тільки коли квадрат червоний
			
		};

	});

	const tapGesture = Gesture.Tap()
		.onEnd(() => {
			colorIndex.value = (colorIndex.value + 1) % colors.length;
			console.log('Updated colorIndex:', colorIndex.value);

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
		})
		.onFinalize(() => {
			isPressed.value = false;
		});


	// allows both gestures to work together
	const gesture = Gesture.Simultaneous(tapGesture, panGesture, doubleTapGesture);
	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={[styles.square, animatedStyles]} >
				<Animated.View style={[styles.whiteHalf, innerAnimatedStyles]} />
			</Animated.View>
			
		</GestureDetector>
	);
	}

const styles = StyleSheet.create({
	square: {
	  width: 100,
	  height: 100,
	  backgroundColor: 'white',
	  alignSelf: 'center',
	  position: 'relative',
	  overflow: 'hidden'
	},

	// greenHalf: {
	// 	position: 'absolute',
	// 	width: '100%',
	// 	height: '100%',
	// 	backgroundColor: 'green',
	// 	transform: [{ rotate: '45deg' }],
	// 	top: 0,
	// 	left: -50,
	//   },
	  whiteHalf: {
		position: 'absolute',
		width: '140%',
		height: '140%',
		backgroundColor: 'white',
		transform: [{ rotate: '-45deg' }],
		top: -70,
		left: -70,
	  },
});

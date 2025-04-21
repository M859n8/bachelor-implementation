import React, { useState, useRef, useEffect } from 'react';
import { Image, Dimensions, StyleSheet, View, PanResponder } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import Animated from 'react-native-reanimated';
import {useSharedValue,useAnimatedStyle} from 'react-native-reanimated';

export default function Penny({ index,refCallback, coinSize, targetZonePos}) {

	const offset = useSharedValue({ x: 0, y: 0 });
	const start = useSharedValue({ x: 0, y: 0 });


	const localRef = useRef(null);
	useEffect(() => {
		if (refCallback) {
			refCallback(localRef.current);
		}
	}, [refCallback]);

	const animatedStyle = useAnimatedStyle(() => {
		return {
		  transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
		  ],
		};
	  });
	  

	const panGesture = Gesture.Pan()
		.onBegin((e) => {
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
			let coinLayout;

			if (localRef.current) {
				localRef.current.measure((x, y, width, height, pageX, pageY) => {
					console.log('Координати coin:', { pageX, pageY, width, height });
					coinLayout = {
						x: pageX,
						y: pageY,
					};
					// console.log('This position calculation ', touchOffset.value.x,  e.absoluteX - pageX)

				});
			}
			const relativeX =  coinLayout.x-targetZonePos.value.x;
			const relativeY = coinLayout.y-targetZonePos.value.y


			// checkCoinPosition(relativeX, relativeY)
		
			console.log('relative position', relativeX, relativeY)

		

		})
		.runOnJS(true);

		const gesture = Gesture.Simultaneous(panGesture);


	return( 
        <>


		<GestureDetector gesture={gesture}>
		<Animated.View  
			ref={localRef} 
			style={[
				{ width: coinSize, aspectRatio: 1 },
				animatedStyle // <- додано
			  ]}
		>
		<Image
			source={require("../assets/pennies/frontCoin.png")}
			style={{width: coinSize,
				height: coinSize,
				position: "absolute",

				zIndex: 2,
				resizeMode: "contain"}}
		/>
		</Animated.View>
            
		</GestureDetector>
        </>
    );

};

const styles = StyleSheet.create({
    coinContainer: {
        // position: "absolute",
    },
   
});
import React, { useState, useRef, useEffect } from 'react';
import { Image, Dimensions, StyleSheet, View, PanResponder } from "react-native";

import Animated, { useSharedValue, useAnimatedStyle, runOnJS} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';



export default function Penny({index, setElements, round, setCoinData, targetZonePos , coinSize}) {
    const startCoords = useRef({ x: 0, y: 0 });//start coords that will be send to the backend
    const startTime = useRef(0); //start time that will be send to the backend

	const [gotToBox, setGotToBox] = useState(false);
	//for hand change points detection
    const lastSpeed = useRef(0); 
    const angleHistory=useRef([]);
    const handChangePoints = useRef([]);

	const offset = useSharedValue({ x: 0, y: 0 });//current coin position
	const start = useSharedValue({ x: 0, y: 0 });//start coords before each move
    
    const droppedCoin = useRef(false); //dropped coin identifier
    const droppedCoinPoints = useRef([]); //array of dropped coins
    
	//function for drop processing
	const registerDroppedCoin = (x, y, time) => {
		droppedCoinPoints.current.push({ x, y, timeStart: time, timeEnd: null, time: null });
	};
	//function for processing coin lifting
	const registerLiftedCoin = (x, y, time) => {
		const coin = droppedCoinPoints.current.find(c => c.timeEnd === null);
	
		if (coin) {
			coin.timeEnd = time;
			coin.time = time - coin.timeStart;
		} else {
			console.warn("No active dropped coin found to mark as lifted.");
		}
		// console.log('dropped coins', droppedCoinPoints.current);
	};

	//change coin status left/fight
	const moveCoin = (id, newStatus) => {
		setElements((prevElements) => {
			const updatedElements = prevElements.map((el) =>
				el.id === id ? { ...el, status: newStatus } : el
			);
			return updatedElements;
		}); 
	};
    

	//group all data about coin that will be send to the backend
    const collectCoinData = (coinId, startCoords, endCoords) => {
		const endTime = Date.now();
	
		const coinData = {
			id: coinId,
			start_coordinates: { x: startCoords.x, y: startCoords.y },
			end_coordinates: { x: endCoords.x, y: endCoords.y },
			time_start: startTime.current,
			time_end: endTime,
			errors: droppedCoinPoints.current,
			hand_change_points: handChangePoints.current,
			round: round
		};
	
		setCoinData((prevCoinData) => {
			const existingIndex = prevCoinData.findIndex(
				(coin) => coin.id === coinData.id && coin.round === coinData.round
			);
	
			if (existingIndex === -1) {
				return [...prevCoinData, coinData];
			}
	
			const updatedCoin = {
				...prevCoinData[existingIndex],
				end_coordinates: coinData.end_coordinates,
				time_end: coinData.time_end,
				errors: coinData.errors,
				hand_change_points: coinData.hand_change_points
			};
	
			return [
				...prevCoinData.slice(0, existingIndex),
				updatedCoin,
				...prevCoinData.slice(existingIndex + 1)
			];
		});
	};
	
    //identify possible hand change points based on speed and ange changes
    const getChangeHand = (event) => {
		const speed = Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2); 
		const directionRadians = Math.atan2(event.translationY, event.translationX);
		const directionDegrees = directionRadians * (180 / Math.PI);
	
		//save angles to array , so average angle will be calculated
		angleHistory.current.push(directionDegrees);
		if (angleHistory.current.length > 13) {
			angleHistory.current.shift();
		}
	
		const avgAngleChange = Math.abs(
			angleHistory.current[angleHistory.current.length - 1] - 
			angleHistory.current[0]
		);
	
		//check if speed and angle chenge are significant
		if (lastSpeed.current < 500 && speed > 500 && avgAngleChange > 0.05) {
			// console.log(`	Можлива зміна руки! Speed ${speed}, coords ${event.absoluteX}, ${event.absoluteY}`);
			//add hand change point
			handChangePoints.current.push({
				x: event.absoluteX,
				y: event.absoluteY,
				time: Date.now()
			});
		}
		//save last speed for future processing
		lastSpeed.current = speed;
	};
	
	//function for drop zone identification
    const getDropZone = (coinLayout) => {
		const {x , y} = coinLayout;

		// console.log('coin layout ', x, y ,'and target zone',targetZonePos.x, targetZonePos.y, '+width',  )
		return (
			x >= targetZonePos.x &&
			x <= targetZonePos.x + targetZonePos.width &&
			y >= targetZonePos.y &&
			y <= targetZonePos.y + targetZonePos.height
		);

      };




	//function to handle end of the coin movement
	const handleDrop = async (e) => {
		const pos = {x:e.absoluteX, y:e.absoluteY}
		//check if coin is in drop zone
		const dropZone = getDropZone(pos); 
		if (dropZone) {
			
			round === 1 ? moveCoin(index, 'right') : moveCoin(index, 'left');
			setGotToBox(true);

		} else {
			// console.log('diff between event', e.absoluteX, e.absoluteY)
			//fi coin not in drop zone - register error
			registerDroppedCoin(e.absoluteX, e.absoluteY, Date.now());
			droppedCoin.current = true;
		}
			
	};
	//animated style for movement visualization
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
			startTime.current = Date.now(); //start time for coin movement
			console.log('start time is ', startTime.current);

			if(droppedCoin.current){
				console.log("#########Помилка!", droppedCoin.current);
				//coin is picked
				// registerDroppedCoin(position.x._value, position.y._value, Date.now());
				// registerDroppedCoin(e.absoluteX, e.absoluteY, Date.now());
				registerLiftedCoin(e.absoluteX, e.absoluteY, Date.now());

				// console.log(`error points detail ${position.x._value}`);
			}else{
				startCoords.current = {x: e.absoluteX, y: e.absoluteY}
				// console.log('set start', startCoords.current)
			}
			droppedCoin.current = false;
 
		})
		.onUpdate((event) => {
			offset.value = {
				x: event.translationX + start.value.x,
				y: event.translationY + start.value.y,
			};
			getChangeHand(event);
			// runOnJS(getChangeHand)(event)

		})
		.onEnd((e) => {
			
			// setActiveCoin(null);
			const endCoords = { x: e.absoluteX, y: e.absoluteY };
            // collectCoinData(index, startCoords.current, endCoords);

			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			handleDrop(e);
            collectCoinData(index, startCoords.current, endCoords);


		})
		.runOnJS(true);
		const gesture = Gesture.Simultaneous(panGesture);
          		
              

    return( 
        <>

		<GestureDetector gesture={gesture}>
		<Animated.View
			// ref={localRef}
			style={[
				{
					width: coinSize,
					height: coinSize,
					// position: 'absolute', // <- ДОДАЙ ЦЕ
					marginBottom: 10,

					zIndex: 3,
				},
				animatedStyle,
			]}
		>
            <Image
                source={require("../assets/pennies/frontCoin.png")}
                style={[{
					width: coinSize,
                    height: coinSize,
                    position: "absolute",
                    zIndex: 2,
                    resizeMode: "contain"},
					gotToBox ? { opacity: 0.5 } : {}]}
            />
        </Animated.View>
		</GestureDetector>
           
        </>
    );
}

// const styles = StyleSheet.create({
//     coinContainer: {
//         // position: "absolute",
//     },

//     // coinImage: {
//     //     width: coinSize,
//     //     height: coinSize,
//     //     resizeMode: "contain",
//     // },
// });
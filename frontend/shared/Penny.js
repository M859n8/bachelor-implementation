import React, { useState, useRef } from 'react';
import { Image} from "react-native";

import Animated, { useSharedValue, useAnimatedStyle, runOnJS} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';


//penny element from transferring pennies test
export default function Penny({index, setElements, round, setCoinData, targetZonePos , coinSize}) {
    const startCoords = useRef({ x: 0, y: 0 });//start coords that will be send to the backend
    const startTime = useRef(0); //start time that will be send to the backend

	const [gotToBox, setGotToBox] = useState(false); //to check if coin is in the box

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
		}
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
				//if it is first record for this coin in this round
				return [...prevCoinData, coinData];
			}
			//if there was already a record of this coin, there is no need to update the starting time and coordinates
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
		//get current speed and angle
		const speed = Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2); 
		const directionRadians = Math.atan2(event.translationY, event.translationX);
		const directionDegrees = directionRadians * (180 / Math.PI);
	
		//save angles to array , so average angle will be calculated
		angleHistory.current.push(directionDegrees);
		if (angleHistory.current.length > 13) {
			angleHistory.current.shift();
		}
		//calculate average angle change
		const avgAngleChange = Math.abs(
			angleHistory.current[angleHistory.current.length - 1] - 
			angleHistory.current[0]
		);
	
		//check if speed and angle chenge are significant
		if (lastSpeed.current < 500 && speed > 500 && avgAngleChange > 0.05) {
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
		//check if coords are in the target zone
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
			//change coin state 
			round === 1 ? moveCoin(index, 'right') : moveCoin(index, 'left');
			setGotToBox(true);

		} else {
			//if coin is not in the drop zone - register error
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
	//gesture to handle the movement
	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			startTime.current = Date.now(); //start time for coin movement

			if(droppedCoin.current){
				//coin is picked after error
				registerLiftedCoin(e.absoluteX, e.absoluteY, Date.now());

			}else{
				startCoords.current = {x: e.absoluteX, y: e.absoluteY}
			}
			droppedCoin.current = false;
 
		})
		.onUpdate((event) => {
			offset.value = {
				x: event.translationX + start.value.x,
				y: event.translationY + start.value.y,
			};
			getChangeHand(event); //detect hand changes during movement

		})
		.onEnd((e) => {
			
			const endCoords = { x: e.absoluteX, y: e.absoluteY };//save end coords

			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			handleDrop(e); //check if it is a error drop or coin is in the taget zone
            collectCoinData(index, startCoords.current, endCoords); //save data about this movement


		})
		.runOnJS(true);

		const gesture = Gesture.Simultaneous(panGesture);
          		
              

    return( 
        <>

		<GestureDetector gesture={gesture}>
		<Animated.View
			style={[
				{
					width: coinSize,
					height: coinSize,
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


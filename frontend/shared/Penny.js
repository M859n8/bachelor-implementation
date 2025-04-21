import React, { useState, useRef, useEffect } from 'react';
import { Image, Dimensions, StyleSheet, View, PanResponder } from "react-native";

// import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';



export default function Penny({ index, setActiveCoin, moveCoin, round, setCoinData, handChangePointsTest, refCallback, targetZonePos, coinSize}) {

    // const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const startCoords = useRef({ x: 0, y: 0 });
    // const [data, setData] = useState({ coins: [] }); // Структура з coins

	const screenWidth = Dimensions.get("window").width;
	// const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)


    const lastSpeed = useRef(0);
    // const lastDirection = useRef(null);
    // const lastHandChangeTime = useRef(null);
    const angleHistory=useRef([]);
    // const [handChangePoints, setHandChangePoints] = useState([]); 

    const handChangePoints = useRef([]);


	const offset = useSharedValue({ x: 0, y: 0 });
	const start = useSharedValue({ x: 0, y: 0 });

    ///////////////////////////////////////////////////////////////////////debug
    // Додаємо точку зміни руки
    const registerHandChange = (x, y, time) => { //debug
        // setHandChangePoints((prevPoints) => {
        //     const updatedPoints = [...prevPoints, { x, y }];
        //     console.log("Updated points inside setter:", updatedPoints);
        //     return updatedPoints;
        // });
        handChangePoints.current.push({ x, y , time});

        // Якщо ви хочете перевірити зміни, ви можете додати консоль
        console.log("Updated hand change points:", handChangePoints.current);


    };
    /////////////////////////////////////////////////////////////////////

	const localRef = useRef(null);
	useEffect(() => {
		if (refCallback) {
			refCallback(localRef.current);
		}
	}, [refCallback]);
    
    const startTime = useRef(0); //щоб оновлювалося одразу і не чекало рендерингу як у юзстейт
    // const endTimeBackup = useRef(0);


    const droppedCoin = useRef(false);
    const droppedCoinPoints = useRef([]);
    // Додаємо точку error
    const registerDroppedCoin = (x, y, time) => { 
		const tolerance = coinSize;
        const existingIndex = droppedCoinPoints.current.findIndex(
            (coin) => Math.abs(coin.x - x) < tolerance && Math.abs(coin.y - y) < tolerance
        )
        if(existingIndex === -1){
            droppedCoinPoints.current.push({ x, y, timeStart: time, timeEnd: null, time: null});

        }else{
			droppedCoinPoints.current[existingIndex].timeEnd = time ;
            droppedCoinPoints.current[existingIndex].time = 
            time - droppedCoinPoints.current[existingIndex].timeStart;

        }
        
        console.log("Error points:", droppedCoinPoints.current);

    };


    

    const collectCoinData = (coinId, startCoords, endCoords) => {
        const endTime = Date.now();

		console.log("end time before fill", endTime);
        // const timeTaken = (endTime - startTime.current) / 1000;
      
        const coinData = {
            id: coinId,
            start_coordinates: {x: startCoords.x, y: startCoords.y},
            end_coordinates: {x: endCoords.x , y: endCoords.y},
            // time: timeTaken,
            time_start: startTime.current,
            time_end: endTime,
            errors: droppedCoinPoints.current,
            // change_hand_moment: changeHandMoment,
            hand_change_points: handChangePoints.current,
            round: round
        };
    
		// handChangePoints.current.length = 0;
        // droppedCoinPoints.current.length = 0;
		// console.log('check if array is empty', droppedCoinPoints.current );
        // setCoinData((prevData) => [...prevData, coinData]); 
        updateOrAddCoin(coinData)
		console.log('hand change points', coinData.hand_change_points)
		console.log('COIN DATA', coinData)

        // console.log("Hand change points:", handChangePoints);
        // console.log("Error points:", droppedCoinPoints.current);


        // endTimeBackup.current = endTime;
    };


    //I DO NOT NEED THIS. WE UPDATING COINS ON THE VERY END
    function updateOrAddCoin(newCoinData) {
        setCoinData((prevCoinData) => {
          // Шукаємо запис, який відповідає id монетки і раунду
            const existingIndex = prevCoinData.findIndex(
                (coin) => coin.id === newCoinData.id && coin.round === newCoinData.round
            );

        
            // Якщо запису не знайдено — додаємо новий
            if (existingIndex === -1) {
                console.log("Round is", newCoinData.round);
                // handChangePoints.current.length = 0;
                // droppedCoinPoints.current.length = 0;
                // console.log('check if array is empty', handChangePoints.current );

                return [...prevCoinData, newCoinData];
            }
        
            // Якщо запис знайдено — створюємо новий об'єкт із оновленими даними
            const updatedCoin = {
                ...prevCoinData[existingIndex],
                // Оновлюємо лише потрібні поля
                end_coordinates: newCoinData.end_coordinates,
                time_end: newCoinData.time_end,
                // errors: [


                errors: newCoinData.errors,
                hand_change_points: newCoinData.hand_change_points
            };
           
          
          // Повертаємо новий масив з оновленим записом
            return [
                ...prevCoinData.slice(0, existingIndex),
                updatedCoin,
                ...prevCoinData.slice(existingIndex + 1)
            ];
        });
        // handChangePoints.current.length = 0;
        // droppedCoinPoints.current.length = 0;

      }
    


    // const toDegrees = (radians) => (radians * 180) / Math.PI;
    const getChangeHand = (event) => {
		const speed = Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2); // Загальна швидкість
		const directionRadians = Math.atan2(event.translationY, event.translationX); // Кут руху
		// console.log('hande change params', speed, directionRadians)
		const directionDegrees = directionRadians * (180 / Math.PI);
	
		angleHistory.current.push(directionDegrees);
		if (angleHistory.current.length > 13) {
			angleHistory.current.shift();
		}
	
		const avgAngleChange = Math.abs(
			angleHistory.current[angleHistory.current.length - 1] - 
			angleHistory.current[0]
		);
	
		if (lastSpeed.current < 500 && speed > 500 && avgAngleChange > 0.05) {
			// console.log(`🔄 Можлива зміна руки! Speed ${speed}, coords ${event.absoluteX}, ${event.absoluteY}`);
			console.log(`	Можлива зміна руки! Speed ${speed}, coords ${event.absoluteX}, ${event.absoluteY}`);

			registerHandChange(event.absoluteX, event.absoluteY, Date.now());
		}
		else{
			// if(lastSpeed.current < 0.2 && speed > 0.2){
			// 	console.log('speed problem');
			// }
			// if(avgAngleChange > 0.05){
			// 	console.log('angle problem', avgAngleChange, 'where speed is', lastSpeed.current,'and', speed)

			// }
		}
	
		lastSpeed.current = speed;
	};
	

    const getDropZone = (coinLayout) => {
		const {x , y} = coinLayout;

		console.log('coin layout ', x, y ,'and target zone',targetZonePos.x, targetZonePos.y, '+width',  )

		return (
			x >= targetZonePos.x &&
			x <= targetZonePos.x + targetZonePos.width &&
			y >= targetZonePos.y &&
			y <= targetZonePos.y + targetZonePos.height
		);

      };


	  const animatedStyle = useAnimatedStyle(() => {
		return {
		  transform: [
			{ translateX: offset.value.x },
			{ translateY: offset.value.y },
		  ],
		};
	  });
	  const measureAsync = (ref) => {
		return new Promise((resolve, reject) => {
			if (ref?.current) {
				ref.current.measure((x, y, width, height, pageX, pageY) => {
					resolve({ x: pageX, y: pageY, width, height });
				});
			} else {
				reject("Ref not available");
			}
		});
	};

	const handleDrop = async (e) => {
		// try {
			// const coinLayout = await measureAsync(localRef);
	
			// const relativeX = coinLayout.x - targetZonePos.x;
			// const relativeY = coinLayout.y - targetZonePos.y;
			// console.log('Relative xy', relativeX, relativeY, 'layount', coinLayout.x, coinLayout.y)
			const pos = {x:e.absoluteX, y:e.absoluteY}
			const dropZone = getDropZone(pos);
			// const dropZone = getDropZone(coinLayout);
			console.log('drop zone is', dropZone);
			if (dropZone) {
				
				round === 1 ? moveCoin(index, 'right') : moveCoin(index, 'left');
				// console.log("after move Hand change points:", handChangePoints.current);
			} else {
				// console.log('diff between measure ', coinLayout, 'and event', e.absoluteX, e.absoluteY)
				console.log('diff between event', e.absoluteX, e.absoluteY)

				registerDroppedCoin(e.absoluteX, e.absoluteY, Date.now());
				droppedCoin.current = true;
			}
		// } catch (err) {
		// 	console.error("Failed to measure coin layout:", err);
		// }
	};
	
	
	  


	const panGesture = Gesture.Pan()
		.onBegin((e) => {
			setActiveCoin(index); // Записуємо, яку монету взяли
			startTime.current = Date.now(); // Оновлюється без виклику ререндеру
			// console.log('start time is ', startTime.current);

			if(droppedCoin.current){
				console.log("#########Помилка!", droppedCoin.current);
				//coin is picked
				// registerDroppedCoin(position.x._value, position.y._value, Date.now());
				registerDroppedCoin(e.absoluteX, e.absoluteY, Date.now());

				// console.log(`error points detail ${position.x._value}`);
			}else{
				startCoords.current = {x: e.absoluteX, y: e.absoluteY}
				console.log('set start', startCoords.current)
			}
			droppedCoin.current = false;


			// console.log(`active index is : ${index}`);
			// position.setOffset({ x: position.x._value, y: position.y._value }); //save current pos
			// position.setValue({ x: 0, y: 0 }); // Скидаємо dx/dy, щоб рух був відносно нової точки
 
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
			
			setActiveCoin(null);
			const endCoords = { x: e.absoluteX, y: e.absoluteY };
            collectCoinData(index, startCoords.current, endCoords);

			start.value = {
				x: offset.value.x,
				y: offset.value.y,
			};
			handleDrop(e);

		})
		// .onFinalize((e) => {
		// 	// setTimeout(() => {
		// 		handleDrop(e);
		// 	// }, 10); // 10–50мс зазвичай вистачає

		// })
		.runOnJS(true);
		const gesture = Gesture.Simultaneous(panGesture);
          		
              

    return( 
        <>

<GestureDetector gesture={gesture}>
		<Animated.View
			ref={localRef}
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
                style={{width: coinSize,
                    height: coinSize,
                    position: "absolute",
                    zIndex: 2,
                    resizeMode: "contain"}}
            />
            </Animated.View>
			</GestureDetector>
            <View style={{ position: "absolute", top: 0, left: 0, backgroundColor: 'blue' }}>

            {handChangePoints.current.map((point, index) => (

                <View
                    key={index}
                    style={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "red",
                        left: point.x,
                        top: point.y,
						zIndex: 100,
                    }}
                />
            ))}

			<View style={{ position: "absolute", top: 0, left: 0 }}>

			{handChangePointsTest.current.map((point, index) => (

				<View
					key={index}
					style={{
						position: "absolute",
						width: 10,
						height: 10,
						borderRadius: 5,
						backgroundColor: "green",
						left: point.x,
						top: point.y,
					}}
				/>
			))}
			</View>
        </View>

        </>
    );
}

const styles = StyleSheet.create({
    coinContainer: {
        // position: "absolute",
    },

    // coinImage: {
    //     width: coinSize,
    //     height: coinSize,
    //     resizeMode: "contain",
    // },
});
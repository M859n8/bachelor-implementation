import React, { useState, useRef } from 'react';
import { Image, Dimensions, StyleSheet, View, Animated, PanResponder } from "react-native";

// import { PanGestureHandler, State } from 'react-native-gesture-handler';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


// const coinSize = screenWidth * 0.05; // 15% ширини екрана

export default function Penny({ index, setActiveCoin, moveCoin, round, setCoinData,coinSize, handChangePointsTest}) {

    const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const startCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
    // const [data, setData] = useState({ coins: [] }); // Структура з coins

	// const screenWidth = Dimensions.get("window").width;
	// const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)


    const lastSpeed = useRef(0);
    // const lastDirection = useRef(null);
    // const lastHandChangeTime = useRef(null);
    const angleHistory=useRef([]);
    // const [handChangePoints, setHandChangePoints] = useState([]); 

    const handChangePoints = useRef([]);


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
        // console.log("Updated points:", handChangePoints.current);


    };
    /////////////////////////////////////////////////////////////////////

    
    const startTime = useRef(0); //щоб оновлювалося одразу і не чекало рендерингу як у юзстейт
    // const endTimeBackup = useRef(0);


    const droppedCoin = useRef(false);
    const droppedCoinPoints = useRef([]);
    // Додаємо точку error
    const registerDroppedCoin = (x, y, time) => { 
        const existingIndex = droppedCoinPoints.current.findIndex(
            (coin) => coin.x === x && coin.y === y
        )
        if(existingIndex === -1){
            droppedCoinPoints.current.push({ x, y , time });

        }else{
            droppedCoinPoints.current[existingIndex].time = 
            time - droppedCoinPoints.current[existingIndex].time;

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


                //     ...prevCoinData[existingIndex].errors.slice(0, -1), // Усі помилки, крім останньої
                //     {
                //     ...prevCoinData[existingIndex].errors.at(-1), // Беремо останню помилку
                //     time: prevCoinData[existingIndex].errors.at(-1)?.time - newCoinData.time_start // Віднімаємо час старту нового запису
                //     },
                //     // ...newCoinData.errors // Додаємо нові помилки
                // ],
                // hand_change_points: [
                // ...prevCoinData[existingIndex].hand_change_points,
                // ...newCoinData.hand_change_points
                // ]
                errors: newCoinData.errors,
                hand_change_points: newCoinData.hand_change_points
            };
            // console.log('previous change hand points', prevCoinData[existingIndex].hand_change_points);
            // console.log(' new hand change points', newCoinData.hand_change_points);
            // console.log('updated coin hand change points', updatedCoin.hand_change_points);



            // handChangePoints.current.length = 0;
            // droppedCoinPoints.current.length = 0;
            // console.log("Updated coin error time", updatedCoin.errors);
            // console.log('check if array is empty', handChangePoints.current );

          
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
    


    const panResponder = useRef(
        PanResponder.create({

            onStartShouldSetPanResponder: () => true, //proccessing every touch to the coin
            onPanResponderGrant: () => {
                setActiveCoin(index); // Записуємо, яку монету взяли
                startTime.current = Date.now(); // Оновлюється без виклику ререндеру
				// console.log('start time is ', startTime.current);

                if(droppedCoin.current){
                    // console.log("#########Помилка!");
					//coin is picked
                    registerDroppedCoin(position.x._value, position.y._value, Date.now());
                    // console.log(`error points detail ${position.x._value}`);
                }
                droppedCoin.current = false;


                // console.log(`active index is : ${index}`);
                position.setOffset({ x: position.x._value, y: position.y._value }); //save current pos
                position.setValue({ x: 0, y: 0 }); // Скидаємо dx/dy, щоб рух був відносно нової точки
 
            },
            onPanResponderMove:(event, gestureState) =>{
                // const speed = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2); // Загальна швидкість
                // const directionRadians = Math.atan2(gestureState.dy, gestureState.dx); // Кут руху
                // // const directionDegrees = directionRadians * (180 / Math.PI);
                // // const directionChange = Math.abs(directionDegrees - lastDirection.current);

                // angleHistory.current.push(directionRadians);
                // if (angleHistory.current.length > 13) {
                //     angleHistory.current.shift();
                // }

                // const avgAngleChange = Math.abs(
                //     toDegrees(angleHistory.current[angleHistory.current.length - 1]) - 
                //     toDegrees(angleHistory.current[0])
                // );

                // if (lastSpeed.current < 0.2 && speed > 0.3 && avgAngleChange > 0.1) {
                //     // console.log(`direction change ${directionDegrees} and last ${lastDirection.current}`);
                //     console.log(`angle history ${avgAngleChange}`);
                //     console.log(`🔄 Можлива зміна руки! Speed ${speed}, coordinates(x) ${ position.x._value}`);
                //     lastHandChangeTime.current = Date.now();

                //     // Реєструємо місце зміни руки
                //     registerHandChange(position.x._value, position.y._value);

                // }

                // lastSpeed.current = speed;
                // lastDirection.current = directionDegrees;
                // Animated.event(
                //     [null, { dx: position.x, dy: position.y }],
                //     { useNativeDriver: false }
                // )
                getChangeHand(gestureState);
                Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false })(event, gestureState);
    
                

            }, 
            onPanResponderRelease: () => {
                setActiveCoin(null);
                position.flattenOffset(); // Записуємо нові координати як початкову точку

				const endCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
                collectCoinData(index, startCoords, endCoords);
               

                // Отримуємо коректні координати після руху
                const dropZone = getDropZone(position.x.__getValue(), position.y.__getValue());

                // Переміщаємо монету
                if (dropZone) {
                    // const endCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
        // console.log("Hand change points:", handChangePoints);

                    
                    // collectCoinData(index, startCoords, endCoords);

                    moveCoin(index, dropZone);
                    console.log("after move Hand change points:", handChangePoints.current);


                }else{
					//coin is dropped
                    registerDroppedCoin(position.x._value, position.y._value, Date.now());
					droppedCoin.current = true;

                }
            },
        })
    ).current;

    // const toDegrees = (radians) => (radians * 180) / Math.PI;
    const getChangeHand = (gestureState) => {
        const speed = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2); // Загальна швидкість
        const directionRadians = Math.atan2(gestureState.dy, gestureState.dx); // Кут руху
        const directionDegrees = directionRadians * (180 / Math.PI);
        // const directionChange = Math.abs(directionDegrees - lastDirection.current);

        angleHistory.current.push(directionDegrees);
        if (angleHistory.current.length > 13) {
            angleHistory.current.shift();
        }

        const avgAngleChange = Math.abs(
            angleHistory.current[angleHistory.current.length - 1] - 
            angleHistory.current[0]
        );

        if (lastSpeed.current < 0.2 && speed > 0.2 && avgAngleChange > 0.05) {
            // console.log(`angle history ${avgAngleChange}`);
            // console.log(`🔄 Можлива зміна руки! Speed ${speed}, coordinates(x) ${ position.x._value}`);
            // Реєструємо місце зміни руки
            registerHandChange(position.x._value, position.y._value, Date.now());

        }

        lastSpeed.current = speed;

    }

    const getDropZone = (x, y) => {
        // Логіка для визначення, в яку зону потрапила монетка
        if (round === 1) {
          if (x > screenWidth * 0.9 - 20) {
            // console.log(`change to right ${ screenWidth * 0.9 - 20}  coordinates are ${x}`);

            return 'right'; // Права зона

          }
        } else if (round === 2) {
          if (x < screenWidth * (-0.8) + 40) {
            console.log(`change to left, coin pos ${x}, needed pos ${ screenWidth * 0.1 + 20}`);

            return 'left'; // Ліва зона

          }
        }
        return null;
      };

    return( 
        <>


            <Animated.View
                style={[styles.coinContainer, position.getLayout()]}
                {...panResponder.panHandlers}
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
            <View style={{ position: "absolute", top: 0, left: 0 }}>

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
import React, { useState, useRef } from 'react';
import { Image, Dimensions, StyleSheet, View, Animated, PanResponder } from "react-native";

// import { PanGestureHandler, State } from 'react-native-gesture-handler';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


const screenWidth = Dimensions.get("window").width;
// const coinSize = screenWidth * 0.05; // 15% ширини екрана

export default function Penny({ index, setActiveCoin, height, width, moveCoin, round, setCoinData}) {

    const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const startCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
    // const [data, setData] = useState({ coins: [] }); // Структура з coins


    const lastSpeed = useRef(0);
    // const lastDirection = useRef(null);
    const lastHandChangeTime = useRef(null);
    const angleHistory=useRef([]);
    // const [handChangePoints, setHandChangePoints] = useState([]); 

    const handChangePoints = useRef([]);


    ///////////////////////////////////////////////////////////////////////debug
    // Додаємо точку зміни руки
    const registerHandChange = (x, y) => { //debug
        // setHandChangePoints((prevPoints) => {
        //     const updatedPoints = [...prevPoints, { x, y }];
        //     console.log("Updated points inside setter:", updatedPoints);
        //     return updatedPoints;
        // });
        handChangePoints.current.push({ x, y });

        // Якщо ви хочете перевірити зміни, ви можете додати консоль
        console.log("Updated points:", handChangePoints.current);


    };
    /////////////////////////////////////////////////////////////////////

    const droppedCoin = useRef(false);
    const droppedCoinPoints = useRef([]);
    // Додаємо точку error
    const registerDroppedCoin = (x, y) => { 
        droppedCoinPoints.current.push({ x, y });
        console.log("Error points:", droppedCoinPoints.current);

    };


    
    const startTime = useRef(0); //щоб оновлювалося одразу і не чекало рендерингу як у юзстейт
    const endTimeBackup = useRef(0);


    const collectCoinData = (coinId, startCoords, endCoords, error = null) => {
        const endTime = Date.now();


        const timeTaken = (endTime - startTime.current) / 1000;
        // const betweenTries= ( startTime.current - endTimeBackup.current ) / 1000;

        // console.log(`Start time is ${startTime.current}, end time is ${endTime}, time taken is ${timeTaken}, time between tries ${betweenTries}, backup end time ${endTimeBackup.current}`);
    

        const coinData = {
            id: coinId,
            start_coordinates: {x : startCoords.x, y: startCoords.y},
            end_coordinates: { x: endCoords.x , y: endCoords.y},
            time: timeTaken,
            errors: droppedCoinPoints.current,
            // change_hand_moment: changeHandMoment,
            hand_change_points: handChangePoints.current,
            round: round
        };
    
        // setCoinData((prevData) => ({
        //     ...prevData,
        //     coinData: [...prevData.coinData, coinData]
        // }));
        setCoinData((prevData) => [...prevData, coinData]); 

        console.log("Hand change points:", handChangePoints);
        console.log("Error points:", droppedCoinPoints.current);


        // console.log("Data : ", coinData);
        endTimeBackup.current = endTime;
    };
    


    const panResponder = useRef(
        PanResponder.create({

            onStartShouldSetPanResponder: () => true, //proccessing every touch to the coin
            onPanResponderGrant: () => {
                setActiveCoin(index); // Записуємо, яку монету взяли
                startTime.current = Date.now(); // Оновлюється без виклику ререндеру

                if(droppedCoin.current){
                    console.log("#########Помилка!");
                    registerDroppedCoin(position.x._value, position.y._value);
                    console.log(`error points detail ${position.x._value}`);
                }
                droppedCoin.current = true;


                // console.log(`active index is : ${index}`);
                position.setOffset({ x: position.x._value, y: position.y._value }); //save current pos
                position.setValue({ x: 0, y: 0 }); // Скидаємо dx/dy, щоб рух був відносно нової точки

                

                
               
            },
            onPanResponderMove:(event, gestureState) =>{
                const speed = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2); // Загальна швидкість
                const directionRadians = Math.atan2(gestureState.dy, gestureState.dx); // Кут руху
                // const directionDegrees = directionRadians * (180 / Math.PI);
                // const directionChange = Math.abs(directionDegrees - lastDirection.current);

                angleHistory.current.push(directionRadians);
                if (angleHistory.current.length > 13) {
                    angleHistory.current.shift();
                }

                const avgAngleChange = Math.abs(
                    toDegrees(angleHistory.current[angleHistory.current.length - 1]) - 
                    toDegrees(angleHistory.current[0])
                );

                if (lastSpeed.current < 0.2 && speed > 0.3 && avgAngleChange > 0.1) {
                    // console.log(`direction change ${directionDegrees} and last ${lastDirection.current}`);
                    console.log(`angle history ${avgAngleChange}`);
                    console.log(`🔄 Можлива зміна руки! Speed ${speed}, coordinates(x) ${ position.x._value}`);
                    lastHandChangeTime.current = Date.now();

                    // Реєструємо місце зміни руки
                    registerHandChange(position.x._value, position.y._value);

                }

                lastSpeed.current = speed;
                // lastDirection.current = directionDegrees;
                // Animated.event(
                //     [null, { dx: position.x, dy: position.y }],
                //     { useNativeDriver: false }
                // )
                Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false })(event, gestureState);
    
                

            }, 
            onPanResponderRelease: () => {
                setActiveCoin(null);
                position.flattenOffset(); // Записуємо нові координати як початкову точку
               

                // Отримуємо коректні координати після руху
                const dropZone = getDropZone(position.x.__getValue(), position.y.__getValue());

                // Переміщаємо монету
                if (dropZone) {
                    const endCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
        // console.log("Hand change points:", handChangePoints);

                    
                    collectCoinData(index, startCoords, endCoords);

                    moveCoin(index, dropZone);
        console.log("after move Hand change points:", handChangePoints);


                }
            },
        })
    ).current;

    const toDegrees = (radians) => (radians * 180) / Math.PI;

    const getDropZone = (x, y) => {
        // Логіка для визначення, в яку зону потрапила монетка
        if (round === 1) {
          if (x > screenWidth * 0.9 - 20) {
            // console.log(`change to right ${ screenWidth * 0.9 - 20}  coordinates are ${x}`);

            return 'right'; // Права зона

          }
        } else if (round === 2) {
          if (x < screenWidth * 0.1 + 20) {
            // console.log('change to left');

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
                style={{width: width,
                    height: height,
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
        </View>
        </>
    );
}

const styles = StyleSheet.create({
    coinContainer: {
        position: "absolute",
    },
    // coinImage: {
    //     width: coinSize,
    //     height: coinSize,
    //     resizeMode: "contain",
    // },
});
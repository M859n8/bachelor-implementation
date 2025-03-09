import React, { useState, useRef } from 'react';
import { Image, Dimensions, StyleSheet, View, Animated, PanResponder } from "react-native";

// import { PanGestureHandler, State } from 'react-native-gesture-handler';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


const screenWidth = Dimensions.get("window").width;
// const coinSize = screenWidth * 0.05; // 15% ширини екрана

export default function Penny({ index, setActiveCoin, height, width, moveCoin, round }) {

    const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const startCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
    const [data, setData] = useState({ coins: [] }); // Структура з coins

   
    const startTime = Date.now();

    const collectCoinData = (coinId, startCoords, endCoords, startTime, error = null, changeHandMoment = null) => {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000;
    
        const coinData = {
            id: coinId,
            start_coordinates: {x : startCoords.x, y: startCoords.y},
            end_coordinates: { x: endCoords.x , y: endCoords.y},
            time: timeTaken,
            errors: error ? [{ type: error.type, coordinates: error.coordinates }] : [],
            change_hand_moment: changeHandMoment
        };
    
        setData((prevData) => ({
            ...prevData,
            coins: [...prevData.coins, coinData]
        }));
        console.log("Data : ", coinData);
    };
    

    const panResponder = useRef(
        PanResponder.create({

            onStartShouldSetPanResponder: () => true, //proccessing every touch to the coin
            onPanResponderGrant: () => {
                setActiveCoin(index); // Записуємо, яку монету взяли
                console.log(`active index is : ${index}`);
                position.setOffset({ x: position.x._value, y: position.y._value }); //save current pos
                position.setValue({ x: 0, y: 0 }); // Скидаємо dx/dy, щоб рух був відносно нової точки
            },
            onPanResponderMove:  Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                setActiveCoin(null);
                position.flattenOffset(); // Записуємо нові координати як початкову точку
               

                // Отримуємо коректні координати після руху
                const dropZone = getDropZone(position.x.__getValue(), position.y.__getValue());

                // Переміщаємо монету
                if (dropZone) {
                    moveCoin(index, dropZone);
                    const endCoords = { x: position.x.__getValue(), y: position.y.__getValue() };
                    
                    collectCoinData(index, startCoords, endCoords, startTime);
                }
            },
        })
    ).current;

    const getDropZone = (x, y) => {
        // Логіка для визначення, в яку зону потрапила монетка
        if (round === 1) {
          if (x > screenWidth * 0.9 - 20) {
            console.log(`change to right ${ screenWidth * 0.9 - 20}  coordinates are ${x}`);

            return 'right'; // Права зона

          }
        } else if (round === 2) {
          if (x < screenWidth * 0.1 + 20) {
            console.log('change to left');

            return 'left'; // Ліва зона

          }
        }
        return null;
      };

    return( 

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
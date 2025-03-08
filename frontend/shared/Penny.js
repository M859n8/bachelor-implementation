import React, { useState, useRef } from 'react';
import { Image, Dimensions, StyleSheet, View, Animated, PanResponder } from "react-native";

// import { PanGestureHandler, State } from 'react-native-gesture-handler';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


const screenWidth = Dimensions.get("window").width;
const coinSize = screenWidth * 0.05; // 15% ширини екрана

export default function Penny({ index, setActiveCoin }) {

    // const translateX = useSharedValue(0);
    // const translateY = useSharedValue(0);
    // const animatedStyle = useAnimatedStyle(() => ({
    //     transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    // }));

    // const onGestureEvent = (event) => {
    //     translateX.value = event.translationX;
    //     translateY.value = event.translationY;
    // };
    // const onHandlerStateChange = (event) => {
    //     if (event.nativeEvent.state === State.END) {
    //         setActiveCoin(index); // Встановлюємо активну монетку
    //         translateX.value = withSpring(0);
    //         translateY.value = withSpring(0);
    //     }
    // };

    const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setActiveCoin(index); // Записуємо, яку монету взяли
                console.log(`active index is : ${index}`);
                position.setOffset({ x: position.x._value, y: position.y._value }); 
                position.setValue({ x: 0, y: 0 }); // Скидаємо dx/dy, щоб рух був відносно нової точки
       
            },
            onPanResponderMove:  Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                setActiveCoin(null);
                position.flattenOffset(); // Записуємо нові координати як початкову точку
            },
        })
    ).current;

    return( 
        // <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        //     <Animated.View style={[styles.coin, animatedStyle]}>
        //         <Image source={require('../assets/pennies/frontCoin.png')} style={styles.coinImage} />
        //     </Animated.View>
        // </PanGestureHandler>

            <Animated.View
                style={[styles.coinContainer, position.getLayout()]}
                {...panResponder.panHandlers}
            >
                <Image
                    source={require("../assets/pennies/frontCoin.png")}
                    style={styles.coinImage}
                />
            </Animated.View>
    );
}

const styles = StyleSheet.create({
    coinContainer: {
        position: "absolute",
    },
    coinImage: {
        width: coinSize,
        height: coinSize,
        resizeMode: "contain",
    },
});
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';


import * as ScreenOrientation from 'expo-screen-orientation';
//ТРЕБА ЗРОБИТИ ДЕВЕЛОПМЕНТ БІЛТ ЩОБ ВОНОО ПРАЦЮВАЛО
const LockOrientation = () => {
  useEffect(() => {
	
    // Локалізуємо екран в вертикальній орієнтації
    // const lockOrientation = async () => {
	// 	try {
	// 		const supportsPortraitUp = await ScreenOrientation.supportsOrientationLockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
			
	// 		if (supportsPortraitUp) {
	// 		  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
	// 		  console.log('Screen orientation locked to portrait.');
	// 		} else {
	// 		  console.log('Portrait orientation is not supported on this device.');
	// 		}
	// 	  } catch (error) {
	// 		console.error('Error locking orientation:', error);
	// 	  }
	//   };

    // lockOrientation();

    // // Дозволяємо відновлення орієнтації при розмонтуванні компонента
    // return () => {
    //   ScreenOrientation.unlockAsync();
	//   console.log('Orientation unlocked.');
    // };
		
		
  }, []);

  return null; // Цей компонент не відображає нічого на екрані
};

export default LockOrientation;

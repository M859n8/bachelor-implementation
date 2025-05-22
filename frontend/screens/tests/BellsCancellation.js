/**
 * Author: Maryna Kucher
 * Description: Main file for the Bells Cancellation Test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */

import { StyleSheet, View, Image, TouchableOpacity, Dimensions  } from 'react-native';
import React, { useState, useRef } from 'react';
import CustomButton from '../../shared/CustomButton.js';
import generateObjects from '../../shared/GenerateBells.js';
import RulesModal from '../../shared/RulesModal.js';
import Timer from '../../shared/Timer.js';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';

import {sendRequest} from '../../shared/sendRequest.js';

export default function BellsCancellation() {
	const navigation = useNavigation(); //used to navigate to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //used to update the auth flag based on server response
	const [rulesModal, setRulesModal] = useState(true);

	const [timerIsRunning, setTimerIsRunning] = useState(false); 

    const [objects, setObjects] = useState(()=> generateObjects()); //array with objects 
    const [isLoading, setIsLoading] = useState(false); //loading state for end test button
    const startTime = useRef(0); //saves the start time

    const imageMap = { //objects imajes with corresponding type
        0: require("../../assets/bells/processed_0.png"),
        1: require("../../assets/bells/processed_1.png"),
        2: require("../../assets/bells/processed_2.png"),
        3: require("../../assets/bells/processed_3.png"),
        4: require("../../assets/bells/processed_4.png"),
        5: require("../../assets/bells/processed_5.png"),
        6: require("../../assets/bells/processed_6.png"),
        7: require("../../assets/bells/processed_7.png"),
        8: require("../../assets/bells/processed_8.png"),
        9: require("../../assets/bells/processed_9.png"),
        10: require("../../assets/bells/processed_10.png"),
        11: require("../../assets/bells/processed_11.png"),
        12: require("../../assets/bells/processed_12.png"),
        13: require("../../assets/bells/processed_14.png"),

    };
    
	//function that handles click on object
    const handleImageClick = (clickedImg) => {
		//check if obj has not been touched before and upd touch flag
        setObjects((prevObjects) =>
			prevObjects.map((img) => {
				if (img.id === clickedImg.id && img.touched === false) {
					return { ...img, touched: true, time: Date.now() };
				}
				return img;
			})
		);
            
    };

	//send data to the backend
    const endGame = async () => {
        setIsLoading(true); //button in the loading state
		setTimerIsRunning(false); //stop the timer

		//fill bell object array and array with error clicked objects
        const bellsObjects = objects.filter(obj => obj.type === 0);
        const otherObjects = objects.filter(obj => obj.type !== 0 && obj.touched === true);
		//set additional data about general game process
        const additionalData = {
            startTime: startTime.current,
            endTime: Date.now(),  //set the end time 
            fieldWidth: Dimensions.get('window').width * 0.9,
            fieldHeight:  Dimensions.get('window').height * 0.75,
			allObjectsCount: objects.length,
        };

		//form a request body
        const requestBody ={
            bellsObjects : bellsObjects,
            additionalData : additionalData,
			otherObjects : otherObjects,
        }

		//send the request using a separate component from ../shared/directory
		await sendRequest({
			url: 'http://localhost:5000/api/result/bells/saveResponse',
			body: requestBody,
			setIsAuthenticated,
			navigation,
			onSuccess: result => navigation.navigate('Results', { result })
		});

       
    };

    return (
        <View style={styles.container}>
    
			<RulesModal //rules are shown at the start 
				visible={rulesModal} 
				rules='The page shows a space with various objects. Find all the elements in the shape of a bell. When you are sure that all bells are selected, click on the `End test` button.' 
				onClose={() => {
					setRulesModal(false);
					startTime.current = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			
		<Timer isRunning={timerIsRunning} startTime={startTime.current} />
            
		<View  style={styles.gameArea}>

			{objects.map((img) => ( //create objests with coordinates calculated with generateObjects()
				<TouchableOpacity
					key={img.id}
					onPress={() => handleImageClick(img)} 
					style={[styles.bellImg, { left: img.x, top: img.y }]}
				>

					<Image 
						source={imageMap[img.type] || require("../../assets/bells/processed_0.png")} 
						style={[styles.image, (img.touched && img.type === 0) ? { opacity: 0.1 } : {}]}

					/>
				</TouchableOpacity>
			))}
		</View>
		<CustomButton onPress={endGame} 
			title={isLoading ? 'Loading ...' : 'End Game'}
			disabled={isLoading}
		/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5'
    },
    screenText: {
        fontSize: 24
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalText: {
        fontSize: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        textAlign: 'center'
    }, 

    gameArea: {
		// size of the game field (important for result calculation)
        width: "95%", 
        height: "80%",
        backgroundColor: "white", 
        borderWidth: 2,
        borderColor: "black",
        position: "relative",
    },

    bellImg: {

        position: "absolute", 
    },
    image: {
        width: 40,  //size of the imj (important for pos calculation)
        height: 40,
        resizeMode: "contain", 
    },
});
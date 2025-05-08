import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, TouchableOpacity, Alert, Dimensions  } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Orientation from 'react-native-orientation-locker';
import CustomButton from '../../shared/CustomButton.js';

import generateObjects from '../../shared/GenerateBells.js';
// import generateObjects from '../../shared/GenerateBells.js';
import RulesModal from '../../shared/RulesModal.js';
import Timer from '../../shared/Timer.js';
import { useNavigation } from '@react-navigation/native';


export default function BellsCancellation({route}) {
	const navigation = useNavigation(); 

	const [rulesModal, setRulesModal] = useState(true);
	// const [resultsModal, setResultsModal] = useState(false);
	// const [results, setResults] = useState({ finalScore: 100 });

	const [timerIsRunning, setTimerIsRunning] = useState(false); 


    const [objects, setObjects] = useState(()=> generateObjects()); //array with objects 
    const [isLoading, setIsLoading] = useState(false); 
    // const [additionalData, setAdditionalData] = useState({
    //     startTime: null,
    //     endTime: null,
    //     screenWidth: 0,
    //     screenHeight: 0,
    // });
    const startTime = useRef(0); 

    const imageMap = {
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
        // 13: require("../../assets/bells/processed_13.png"),
        13: require("../../assets/bells/processed_14.png"),

    };
    
    // const objects = useTestObjects();
    // // setObjects(useTestObjects());


    // console.log(objects);

     // Стан для відслідковування натиснутого елементу
     const [clickedObjects, setClickedObjects] = useState([]);

    //  useEffect(() => {
    //     // Заблокуємо орієнтацію екрану в портретному режимі на час тесту
    //     Orientation.lockToPortrait();  // Якщо хочемо заблокувати в портретному режимі
        

    //     // Очищаємо при розмонтуванні компонента
    //     return () => {
    //         Orientation.unlockAllOrientations();  // Відкриває доступ до зміни орієнтації після завершення тесту
    //     };
    // }, []);




    const handleImageClick = (clickedImg) => {
		console.log('entered');
      
        setObjects((prevObjects) =>
			prevObjects.map((img) => {
				if (img.id === clickedImg.id && img.touched === false) {
					console.log(`got coords ${clickedImg.x}, ${clickedImg.y}, id ${img.id}, type ${img.type}`);
					return { ...img, touched: true, time: Date.now() };
				}
				return img;
			})
		);
            // console.log(`time a : ${Date.now()}`);
            
        // console.log(objects);
    };
    
    // useEffect(()=>{
    //     console.log(clickedObjects);

    // }, [clickedObjects]);

 

    const endGame = async () => {
        // setGameOver(true);
        setIsLoading(true);
		setTimerIsRunning(false);
        const bellsObjects = objects.filter(obj => obj.type === 0);
		// console.log('bells', bellsObjects);
        const otherObjects = objects.filter(obj => obj.type !== 0 && obj.touched === true);
		// console.log('other', otherObjects)



        const additionalData = {
            startTime: startTime.current,
            endTime: Date.now(),  // Оновлюємо тільки endTime
            fieldWidth: Dimensions.get('window').width * 0.9,
            fieldHeight:  Dimensions.get('window').height * 0.75,
			allObjectsCount: objects.length,
        };


        const requestBody ={
            bellsObjects : bellsObjects,
            additionalData : additionalData,
			otherObjects : otherObjects,
        }

        const token = await AsyncStorage.getItem('authToken');
        // console.log("Coin data being sent: ", coinData);
        console.log('bells objects', requestBody.bellsObjects)
        console.log('other objects', requestBody.otherObjects)


        //  треба буде десь якось дані про час мвж вибором монеток протягом раунду брати. можна це навіть на бекенді робити
        try {
            console.log("phase 1");
            const response = await fetch('http://192.168.0.12:5000/api/result/bells/saveResponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`

                },
                body: JSON.stringify(requestBody),  //перетворює масив або об'єкт на JSON-рядок
            })
			const result = await response.json();

            if (response.ok) {
                navigation.navigate('Results', { result });
            }
        } catch (error) {
        Alert.alert('Failure', 'Can not send answers');

        }
    };

    return (
        <View style={styles.container}>
            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Among the objects in the picture, click on all the bells as quickly as possible. When you find all the bells, end the game.</Text>
                    <Button title="Start" onPress={handleModalClose} />
                </View>
            </Modal> */}
			<RulesModal 
				visible={rulesModal} 
				rules='Among the objects in the picture, click on all the bells as quickly as possible. When you find all the bells, end the game.' 
				onClose={() => {
					setRulesModal(false);
					startTime.current = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			{/* <ResultsModal 
				visible={resultsModal} 
				results={results} 
				onClose={() => setResultsModal(false)} 
			/> */}
		<Timer isRunning={timerIsRunning} startTime={startTime.current} />
            
		<View  style={styles.gameArea}>

			{objects.map((img) => (
				<TouchableOpacity
				key={img.id}
				onPress={() => handleImageClick(img)} // Обробка натискання
				style={[styles.bellImg, { left: img.x, top: img.y }]}
				>

					{/* <View key={img.id} style={[styles.bellImg, { left: img.x, top: img.y }]}> */}
						<Image 
							source={imageMap[img.type] || require("../../assets/bells/processed_0.png")} 
							style={[styles.image, (img.touched && img.type === 0) ? { opacity: 0.1 } : {}]}

							// Закреслюємо зображення} 
						/>
					{/* </View> */}
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
        width: "95%", // Обмежуємо розмір ігрового поля
        height: "80%",
        backgroundColor: "white", // Фон для поля
        borderWidth: 2,
        borderColor: "black",
        position: "relative",
    },

    bellImg: {

        position: "absolute", // Фіксує положення на екрані
    },
    image: {
        width: 40,  // Розмір зображення (можна змінити)
        height: 40,
        resizeMode: "contain", // Адаптація зображення
    },
});
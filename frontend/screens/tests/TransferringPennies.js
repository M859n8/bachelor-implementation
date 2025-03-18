import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import DopArea from '../../shared/DropArea.js';
import Penny from '../../shared/Penny.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from "expo-screen-orientation";


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)
const dropZoneWidth = screenWidth * 0.1;
const dropZoneHeight = screenHeight * 0.6;

export default function TransferringPennies({route}) {

  const [modalVisible, setModalVisible] = useState(true);

  const [coinData, setCoinData] = useState([] ); // Структура з coins



   // Масиви монеток для лівої і правої сторін
	const [elements, setElements] = useState([
		{ id: 1, status: 'left' },
		{ id: 2, status: 'left' },
		{ id: 3, status: 'left' },
        // { id: 4, status: 'left' },
		// { id: 5, status: 'left' },
		// { id: 6, status: 'left' },
        // { id: 7, status: 'left' },
		// { id: 8, status: 'left' },
		// { id: 9, status: 'left' },
  ]);

	const [activeCoin, setActiveCoin] = useState(null);
	const [round, setRound] = useState(1); // Стан для відстеження поточного раунду
	const [gameOver, setGameOver] = useState(false); // Стан для завершення гри

    /////////////////////////перевірити на мобільному пристрої////////////////////////////////
    const lockOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    };

    useEffect(() => {
        lockOrientation();
    }, []);
    ////////////////////////////////////////////////////////////////////////////////////////


	const moveCoin = (id, newStatus) => {
		setElements((prevElements) => {
		// console.log("Before update:", prevElements);
		
		const updatedElements = prevElements.map((el) =>
			el.id === id ? { ...el, status: newStatus } : el
		);
	
		console.log("After update:", updatedElements);
		
		
		
		return updatedElements;
		}); 
	};

	useEffect(() => {
		checkRoundCompletion();
	}, [elements]);  // Виконається, коли `elements` оновиться


    const checkRoundCompletion = () => {
    

        if (round === 1) {
            const allInRightZone = elements.every((el) => el.status === 'right');
            if (allInRightZone) {
                console.log('R.O.U.N.D 2');

                setRound(2);
                // Можна додати повідомлення чи анімацію між раундами
            }
            
            console.log('not R.O.U.N.D 2');

        } else if (round === 2) {
            const allInLeftZone = elements.every((el) => el.status === 'left');
            if (allInLeftZone) {
                console.log('G.A.M.E O.V.E.R');

                setGameOver(true); // Гра завершена
                sendDataToBackend();

            }

        }
    };

    const sendDataToBackend = async () => {
        const token = await AsyncStorage.getItem('authToken');
        console.log("Coin data being sent: ", coinData);

        //  треба буде десь якось дані про час мвж вибором монеток протягом раунду брати. можна це навіть на бекенді робити
        try {
			const response = await fetch('http://localhost:5000/api/result/pennies/saveResults', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`

				},
				body: JSON.stringify({coinData}), //надсилаємо саме об'єкт
			})
			if (response.ok) {
				Alert.alert('Success', 'Your answers sent!');
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
                    <Text style={styles.modalText}>Правила тесту: Прочитайте інструкцію перед початком.</Text>
                    <Button title="Почати" onPress={() => setModalVisible(false)} />
                </View>
            </Modal> */}


            <Text style={styles.screenText}>{route.name} Screen</Text>

            <View style={styles.gameArea}>
            <View style={styles.dropArea}>
                <Text style={styles.areaText}>Ліва зона</Text>
                
                {round === 1 && elements.map((el) => (
                
                    <Penny 
                        key={el.id} 
                        index={el.id} 
                        setActiveCoin={setActiveCoin} 
                        height={coinSize} 
                        width={coinSize}
                        moveCoin={moveCoin}
                        checkRoundCompletion={checkRoundCompletion}
                        round={round}
                        setCoinData={setCoinData}
                        
                        />
                ))}
            </View>
            {/* Права зона для монеток */}
            <View style={[styles.dropAreaR,{zIndex: round}]}>
                <Text style={styles.areaText}>Права зона</Text>
                {round === 2 && elements.map((el) => (

                <Penny 
                    key={el.id} 
                    index={el.id} 
                    setActiveCoin={setActiveCoin} 
                    height={coinSize} 
                    width={coinSize}
                    moveCoin={moveCoin}
                    checkRoundCompletion={checkRoundCompletion}
                    round={round}
                    setCoinData={setCoinData}
                    />                    
            ))}
            </View>
            </View>
        {/* <h1> Active card {activeCoin}</h1> */}
        <Text>Active coin: {activeCoin !== null ? activeCoin : 'None'}  round ${round} </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, /*займає весь простів*/
        justifyContent: 'center', /*вирівнює центр по вертикалі*/
        alignItems: 'center', /* вирівнює по горизонталі*/
        zIndex: 0,

        backgroundColor: "#f5f5f5"
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
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        position: "relative", // Додаємо відносне позиціонування
        // zIndex: 0,
    },
    dropArea: {
        width: dropZoneWidth, // Ширина зон ~10% екрану
        height: dropZoneHeight, // Висота зони ~60% екрану
        backgroundColor: "#d3d3d3",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        position: 'relative',
        //pointerEvents: "none",
        zIndex: 2,
    },
    dropAreaR: {
      width: dropZoneWidth, // Ширина зон ~10% екрану
      height: dropZoneHeight, // Висота зони ~60% екрану
      backgroundColor: "#d3d3d3",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      position: 'relative',
      //pointerEvents: "none",
      // zIndex: round,
  },
    areaText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        zIndex: 0,
    },
});
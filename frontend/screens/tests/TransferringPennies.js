import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';
import { useState, useEffect , useRef} from 'react';
import Penny from '../../shared/Penny.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from "expo-screen-orientation";
import LockOrientation from '../../shared/LockOrientation.js';
import ResultsModal from '../../shared/resultsModal.js';

// const screenWidth = Dimensions.get("window").width;
// const screenHeight = Dimensions.get("window").height;
// const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)
// const dropZoneWidth = screenWidth * 0.1;
// const dropZoneHeight = screenHeight * 0.6;

export default function TransferringPennies({route}) {

	const [modalVisible, setModalVisible] = useState(true);
	const [resultsModal, setResultsModal] = useState(false);
	const [results, setResults] = useState({ finalScore: 100 });

	const [coinData, setCoinData] = useState([]); // Структура з coins

	////test only
	const handChangePointsTest = useRef([]);
	const [, forceUpdate] = useState(0);
	/////////
	const screenWidth = Dimensions.get("window").width;
	const coinSize = screenWidth * 0.05;

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


    /////////////////////////перевірити на мобільному пристрої////////////////////////////////
    // const lockOrientation = async () => {
    //     await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    // };
    // useEffect(() => {
    //     lockOrientation();
    // }, []);
    ////////////////////////////////////////////////////////////////////////////////////////


	const moveCoin = (id, newStatus) => {
		setElements((prevElements) => {
		// console.log("Before update:", prevElements);
		
		const updatedElements = prevElements.map((el) =>
			el.id === id ? { ...el, status: newStatus } : el
		);
		// console.log("After update:", updatedElements);
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
            
        } else if (round === 2) {
            const allInLeftZone = elements.every((el) => el.status === 'left');
            if (allInLeftZone) {
                console.log('G.A.M.E O.V.E.R');

                // setGameOver(true); // Гра завершена
                sendDataToBackend();
            }
        }
    };

	const distance = (point1, point2) => {
		// Вираховуємо відстань між двома точками
		return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	}
	
    // function to normalize hand_change_points before sending to the backend
	const normalizeData = (coinData) => {
		console.log('got to normalized');
		return coinData.map((coin) => {
            //get horizontal middle of the movement
			const lengthCoordX = Math.abs(coin.end_coordinates.x - coin.start_coordinates.x)
            //delete extreme points. that are <1/8 and >7/8 of the general path
			const extremePointsDeleted = coin.hand_change_points.filter((point) => {
				return Math.abs(point.x) > 0.125 * lengthCoordX && Math.abs(point.x) < 0.875 * lengthCoordX;
			});

			// console.log('length before merge', extremePointsDeleted.length);


            //merge points that are located really close and most likely were created in one hand changing move
			let i = 0;
            while (i < extremePointsDeleted.length - 1) {
				console.log('got to cyckle');
                let point1 = extremePointsDeleted[i];
                let point2 = extremePointsDeleted[i + 1];

                if (distance(point1, point2) < coinSize) {
                    // Об'єднуємо дві точки
                    extremePointsDeleted[i] = {
                        x: (point1.x + point2.x) / 2,
                        y: (point1.y + point2.y) / 2,
                        time: (point1.time + point2.time) / 2
                    };

                    // Видаляємо `point2`, бо вона вже об'єднана
                    extremePointsDeleted.splice(i + 1, 1);
                } else {
                    // Якщо точки не об'єдналися, рухаємося далі
                    i++;
                }
            }
			// console.log('length after merge', extremePointsDeleted.length);
            // console.log('dots after merge', extremePointsDeleted);

            //select one (closest to the middle) point
			let minDistToMiddleIndex = 0;
            //if there are more than one point
			if (extremePointsDeleted.length > 1) {
                //calculate middle of the way
				const middleX = lengthCoordX / 2;
                //if current point is closer to the center, than point with minDistToMiddleIndex, set the new index 
				minDistToMiddleIndex = extremePointsDeleted.reduce((closestIndex, point, index) => {
					return Math.abs(point.x - middleX) < Math.abs(extremePointsDeleted[closestIndex].x - middleX)
						? index
						: closestIndex;
				}, 0);
                //set the closest to middle point
				coin.hand_change_points = extremePointsDeleted[minDistToMiddleIndex];

			}else{
                //if there is one point in arr
				// console.log('got to else');
				coin.hand_change_points = extremePointsDeleted;


			}
			// console.log('after unifiing', mergedPoints);

			// /////// for testing purposes
			// const point = extremePointsDeleted[minDistToMiddleIndex];
			// if (point !== undefined) {
			// handChangePointsTest.current.push(point);
			// forceUpdate((prev) => prev + 1);
			// }
			// console.log('	last hand change point', coin.hand_change_points);
			//////////////
			return coin;
		})

	};

    const sendDataToBackend = async () => {
        const token = await AsyncStorage.getItem('authToken');
		const normalizedData = normalizeData(coinData); //temporaly

        // console.log("Coin data being sent: ", normalizedData);
		console.log('got to send');
        //  треба буде десь якось дані про час мвж вибором монеток протягом раунду брати. можна це навіть на бекенді робити
        try {
			const response = await fetch('http://192.168.0.12:5000/api/result/pennies/saveResponse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`

				},
				body: JSON.stringify(normalizedData), //надсилаємо саме об'єкт
			})
			console.log('got to sended');

			if (response.ok) {
				// Alert.alert('Success', 'Ansvers calculated');
				
				setResults(response); 
				setResultsModal(true);
			}
        } catch (error) {
        Alert.alert('Failure', 'Can not send answers');

        }
        
    };


    return (
        <View style={styles.container}>
            {/* <LockOrientation/> */}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Rules: transfer pennies from one zone to another.</Text>
                    <Button title="Start" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

			<ResultsModal 
				visible={resultsModal} 
				results={results} 
				onClose={() => setResultsModal(false)} 
			/>

			{/* <Modal
                animationType="slide"
                transparent={true}
                visible={gameOver}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>gameOver</Text>
                    <Button title="Почати" onPress={() => setGameOver(false)} />
                </View>
            </Modal> */}


            <View style={styles.gameArea}>
            <View style={styles.dropArea}>
                <Text style={styles.areaText}>Ліва зона</Text>
                
                {round === 1 && elements.map((el) => (
                
                    <Penny 
                        key={el.id} 
                        index={el.id} 
                        setActiveCoin={setActiveCoin} 
                        moveCoin={moveCoin}
                        checkRoundCompletion={checkRoundCompletion}
                        round={round}
                        setCoinData={setCoinData}
					handChangePointsTest={handChangePointsTest} //tet purposes
                        
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
                    moveCoin={moveCoin}
                    checkRoundCompletion={checkRoundCompletion}
                    round={round}
                    setCoinData={setCoinData}
					handChangePointsTest={handChangePointsTest} //test purposes
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
		height: '60%',
        justifyContent: "space-between",
        paddingHorizontal: 20,
        position: "relative", // Додаємо відносне позиціонування
        // zIndex: 0,
    },
    dropArea: {
        width: '10%', // Ширина зон ~10% екрану
        height: '100%', // Висота зони ~60% of the parent zone
        backgroundColor: "#d3d3d3",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        position: 'relative',
        //pointerEvents: "none",
        zIndex: 2,
    },
    dropAreaR: {
    	width: '10%', // Ширина зон ~10% екрану
        height: '100%', // Висота зони ~60% parent zone
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
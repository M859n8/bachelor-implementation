import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';
import { useState, useEffect , useRef} from 'react';
import Penny from '../../shared/Penny.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from "expo-screen-orientation";
import LockOrientation from '../../shared/LockOrientation.js';
import ResultsModal from '../../shared/resultsModal.js';
import RulesModal from '../../shared/RulesModal.js';
import Timer from '../../shared/Timer.js';

// import DeviceInfo from 'react-native-device-info';

// const screenWidth = Dimensions.get("window").width;
// const screenHeight = Dimensions.get("window").height;
// const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)
// const dropZoneWidth = screenWidth * 0.1;
// const dropZoneHeight = screenHeight * 0.6;

export default function TransferringPennies({route}) {

	const [rulesModal, setRulesModal] = useState(true);
	const [round2Modal, setRound2Modal] = useState(false);
	const [resultsModal, setResultsModal] = useState(false);
	const [results, setResults] = useState({ finalScore: 100 });

	const [timerIsRunning, setTimerIsRunning] = useState(false); 

	const [coinData, setCoinData] = useState([]); // Структура з coins

	////test only
	const handChangePointsTest = useRef([]);
	const [, forceUpdate] = useState(0);
	/////////
	const screenWidth = Dimensions.get("window").width;
	const screenHeight = Dimensions.get("window").height;

	const coinSize = screenHeight * 0.06;
	// const screenSizeInches = DeviceInfo.getScreenSize();S 
	const widthInInches = (screenWidth * 0.8 - 20 - 20)/ 160;
	//можливо для переводу в дюцми працюватиме ось це ділення на 160

	// const screenHeight = Dimensions.get("window").height;
	// const heightInInches = (screenHeight* 0.8 - 20 - 20)/ 160;

	// console.log(`size of the screen ${screenWidth} and geight ${screenHeight}` );
	// console.log('width of the screen in cm', widthInInches*2.54, 'height in cm', heightInInches*2.54);




	const additionalData = useRef({
		timeStartRound1:0,
		timeEndRound1:0,
		timeStartRound2:0,
		timeEndRound2:0,
		width: widthInInches,
	});


   // Масиви монеток для лівої і правої сторін
	const [elements, setElements] = useState([
		{ id: 1, status: 'left' },
		{ id: 2, status: 'left' },
		{ id: 3, status: 'left' },
        { id: 4, status: 'left' },
		{ id: 5, status: 'left' },
		{ id: 6, status: 'left' },
        { id: 7, status: 'left' },
		{ id: 8, status: 'left' },
		{ id: 9, status: 'left' },
	 
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
				additionalData.current.timeEndRound1 = Date.now();
				setTimerIsRunning(false);

                // Можна додати повідомлення чи анімацію між раундами
				setRound2Modal(true);

            }
            
        } else if (round === 2) {
            const allInLeftZone = elements.every((el) => el.status === 'left');
            if (allInLeftZone) {
				additionalData.current.timeEndRound2 = Date.now();
				setTimerIsRunning(false);

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

		requestBody = {
			coinData : normalizedData,
            additionalData : additionalData.current
		}

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
				body: JSON.stringify(requestBody), //надсилаємо саме об'єкт
			})
			console.log('got to sended');
			const result = await response.json();

			if (response.ok) {
				// Alert.alert('Success', 'Ansvers calculated');
				
				setResults(result); 
				setResultsModal(true);
			}
        } catch (error) {
        Alert.alert('Failure', 'Can not send answers');

        }
        
    };


    return (
        <View style={styles.container}>
            {/* <LockOrientation/> */}

          
			<RulesModal 
				visible={rulesModal} 
				rules='The pictures shows an object divided into parts. Enter the name of the object in the test field. ONLY ONE HAND at a time' 
				onClose={() => {
					setRulesModal(false);
					additionalData.current.timeStartRound1 = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			<RulesModal 
				visible={round2Modal} 
				rules='Round 2 rules: lorem ipsum' 
				onClose={() => {
					setRound2Modal(false);
					additionalData.current.timeStartRound2 = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			<ResultsModal 
				visible={resultsModal} 
				results={results} 
				onClose={() => setResultsModal(false)} 
			/>
			<Timer isRunning={timerIsRunning} startTime={additionalData.current.timeStartRound1}/>


            <View style={styles.gameArea}>
            <View style={styles.dropArea}>
                
                {round === 1 && elements.map((el) => (
                
                    <Penny 
                        key={el.id} 
                        index={el.id} 
                        setActiveCoin={setActiveCoin} 
                        moveCoin={moveCoin}
                        checkRoundCompletion={checkRoundCompletion}
                        round={round}
                        setCoinData={setCoinData}
						coinSize={coinSize}
					handChangePointsTest={handChangePointsTest} //test purposes

                        
                        />
                ))}
            </View>
            {/* Права зона для монеток */}
            <View style={[styles.dropAreaR,{zIndex: round}]}>
                 {round === 2 && elements.map((el) => (

                <Penny 
                    key={el.id} 
                    index={el.id} 
                    setActiveCoin={setActiveCoin} 
                    moveCoin={moveCoin}
                    checkRoundCompletion={checkRoundCompletion}
                    round={round}
                    setCoinData={setCoinData}
					coinSize={coinSize}

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
        // alignItems: "center",
        // justifyContent: "center",
        borderRadius: 10,
        position: 'relative',
        //pointerEvents: "none",

		flexDirection: 'col',
		// flexWrap: 'wrap',
		gap: '9%',
		padding: 10,
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
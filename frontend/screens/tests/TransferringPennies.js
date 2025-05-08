import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';
import { useState, useEffect , useRef} from 'react';
import Penny from '../../shared/Penny.js';
import {sendAuthenticatedRequest} from '../../shared/sendAuthenticatedRequest.js';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from "expo-screen-orientation";
import RulesModal from '../../shared/RulesModal.js';
import Timer from '../../shared/Timer.js';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TransferringPennies({route}) {
	// const orientation = useOrientation();

	const [rulesModal, setRulesModal] = useState(true);
	const [round2Modal, setRound2Modal] = useState(false);
	const navigation = useNavigation(); //for navigation home

	const [timerIsRunning, setTimerIsRunning] = useState(false); 

	const [coinData, setCoinData] = useState([]); //structure to send to backend


	const { width, height } = Dimensions.get('window');
	// console.log('wisth heigth', width, height)
	const minDimension = Math.min(width, height);
	const maxDimension = Math.max(width, height);

	const coinSize = minDimension * 0.06; //60% - size of the drop area. each coin has to be 10% of area, because we need to include 9 coins in drop area

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

	const additionalData = useRef({
		timeStartRound1:0,
		timeEndRound1:0,
		timeStartRound2:0,
		timeEndRound2:0,
		width: 0,
	});

	// const [activeCoin, setActiveCoin] = useState(null); //active coin for debug
	const [round, setRound] = useState(1); // current round. can be 1 or 2



	const leftZoneRef = useRef(null); //ref on each zone
	const rightZoneRef = useRef(null);

	const [leftZonePos, setLeftZonePos] = useState({ x: 0, y: 0 }); //for zone coords
	const [rightZonePos, setRightZonePos] = useState({ x: 0, y: 0 });

	//measure right and left zines position
	 // Функція для вимірювання позицій
	const measureZones = () => {
		if (leftZoneRef.current) {
		leftZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
			setLeftZonePos({ x: pageX, y: pageY, width, height });
		});
		}
		if (rightZoneRef.current) {
		rightZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
			setRightZonePos({ x: pageX, y: pageY, width, height });
		});
		}
	};

	useEffect(() => {
		const subscription = ScreenOrientation.addOrientationChangeListener((evt) => {
			// con
			// sole.log("Нова орієнтація:", evt.orientationInfo.orientation);
			measureZones();
		});
		
		return () => {
			ScreenOrientation.removeOrientationChangeListener(subscription);
		};
	}, []);
	
	  // Вимірюємо при першому рендері
	useEffect(() => {
		measureZones();
	}, []);

	//measure field width and convert to inches
	useEffect(() => {
		if (leftZonePos.width && rightZonePos.x) {
			const calculatedWidth = (rightZonePos.x - (leftZonePos.x + leftZonePos.width)) / 160;
			// console.log('width in inches', calculatedWidth);
	
			additionalData.current.width = calculatedWidth; // Зберігаємо в useRef без використання useState
		}
	}, [leftZonePos, rightZonePos]);
	
	//check round complection after each coin updates
	useEffect(() => {
		// console.log('before check round coplexion', JSON.stringify(elements, null, 2))
		checkRoundCompletion(); //when element chenges status, check round completion
	}, [elements]); 


    const checkRoundCompletion = () => {
		//check if all elements in correct zone
		const allInZone = round === 1
			? elements.every(el => el.status === 'right')
			: elements.every(el => el.status === 'left');
	
		if (!allInZone) return;
	
		setTimerIsRunning(false);
	
		if (round === 1) {
			additionalData.current.timeEndRound1 = Date.now();
			setRound(2);
			setRound2Modal(true); //show modal between rounds 
		} else if (round === 2) {
			additionalData.current.timeEndRound2 = Date.now();
			sendDataToBackend();
		}
	};
	

	const distance = (point1, point2) => {
		// distance between two dots
		return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	}
	
    // function to normalize hand_change_points before sending to the backend
	const normalizeData = (coinData) => {
		return coinData.map((coin) => {
			// console.log('before normalize', coin.hand_change_points)
            //get horizontal middle of the movement
			const lengthCoordX = Math.abs(coin.end_coordinates.x - coin.start_coordinates.x)
			const startX = coin.start_coordinates.x;
			const endX = coin.end_coordinates.x;

			// визначаємо напрям
			const goingLeft = startX > endX;
            //delete extreme points. that are <1/8 and >7/8 of the general path
			// Гарантуємо, що працюємо з масивом
			const points = Array.isArray(coin.hand_change_points) ? coin.hand_change_points : [];

			// Видаляємо крайні точки
			const extremePointsDeleted = points.filter((point) => {
				const relativeX = goingLeft
					? point.x -endX // якщо йде вліво — вираховуємо відстань "назад"
					: point.x - startX; // якщо вправо — звичайна різниця
			
				return relativeX > 0.125 * lengthCoordX && relativeX < 0.875 * lengthCoordX;
			});
            //merge points that are located really close and most likely were created in one hand changing move
			let i = 0;
            while (i < extremePointsDeleted.length - 1) {
				// console.log('got to cyckle');
                const point1 = extremePointsDeleted[i];
                const point2 = extremePointsDeleted[i + 1];

                if (distance(point1, point2) < coinSize.current) {
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
            //if there are more than one point left, find closest to the middle
			if (extremePointsDeleted.length > 1) {
				const middleX = lengthCoordX / 2;
				const closestToMiddle = extremePointsDeleted.reduce((closest, point) =>
					Math.abs(point.x - middleX) < Math.abs(closest.x - middleX) ? point : closest
				);
				coin.hand_change_points = closestToMiddle;
			
			} else if (extremePointsDeleted.length === 1) {
				//if we detected one hand change point, save it
				coin.hand_change_points = extremePointsDeleted[0];
			
			} 
			else {//if no hand change points left
				//try to take error point as hand change
				coin.hand_change_points = coin.errors?.[0]
					? {
						x: coin.errors[0].x,
						y: coin.errors[0].y,
						time: (coin.errors[0].timeStart + coin.errors[0].timeEnd) / 2
					}
					: null;
			}
			
			return coin;
		})

	};

    const sendDataToBackend = async () => {
		console.log('before normalize')

		// console.log('coinData before normalize:', JSON.stringify(coinData, null, 2));
		const normalizedData = normalizeData(coinData);
		
		const requestBody = {
			// coinData : coinData,
			coinData : normalizedData,
            additionalData : additionalData.current
		}
		await sendAuthenticatedRequest({
			url: 'http://192.168.0.12:5000/api/result/pennies/saveResponse',
			body: requestBody,
			navigation,
			// setIsAuthenticated,
			onSuccess: result => navigation.navigate('Results', { result })
		});
        
    };


    return (
        <View style={styles.container}>
            {/* <LockOrientation/>  */}
			<RulesModal 
				visible={rulesModal} 
				rules='The pictures shows an object divided into parts. Enter the name of the object in the test field. ONLY ONE HAND at a time' 
				onClose={() => {
					setRulesModal(false);
					additionalData.current.timeStartRound1 = Date.now();
					setTimerIsRunning(true);
					console.log('2 measure res', leftZonePos)


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

			
			<Timer isRunning={timerIsRunning} startTime={additionalData.current.timeStartRound1}/>

			{/* <View style={styles.dot}/> */}

            <View style={styles.gameArea}>
            <View style={[styles.dropArea, {}]} ref={leftZoneRef}>
                
                {round === 1 && !rulesModal && elements.map((el) => (
                
				<Penny 
					key={el.id} 
					index={el.id} 
					// setActiveCoin={setActiveCoin} 
					setElements={setElements}
					// elements={elements} //debug
					checkRoundCompletion={checkRoundCompletion}
					round={round}
					setCoinData={setCoinData}
					// refCallback={(ref) => (coinRefs.current[index] = ref)}
					targetZonePos={rightZonePos}
					coinSize={coinSize}
				/>
                ))}
            </View>
            {/* Права зона для монеток */}
            <View style={[styles.dropArea,{zIndex: round}]} ref={rightZoneRef}>
                {round === 2 && elements.map((el) => (

                <Penny 
                    key={el.id} 
                    index={el.id} 
                    // setActiveCoin={setActiveCoin} 
					setElements={setElements}
					// elements={elements} //debug

                    checkRoundCompletion={checkRoundCompletion}
                    round={round}
                    setCoinData={setCoinData}
					// refCallback={(ref) => (coinRefs.current[index] = ref)}
					targetZonePos={leftZonePos}
					coinSize={coinSize}

                />                    
            ))}
            </View>
            </View>
        {/* <h1> Active card {activeCoin}</h1> */}
        {/* <Text>Active coin: {activeCoin !== null ? activeCoin : 'None'}  round ${round} </Text> */}
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
    // screenText: {
    //     fontSize: 24
    // },
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
		flexDirection: 'col',
		flexWrap: 'wrap',
			// gap: '5%',
			// paddingTop: 10,
        zIndex: 2,
    },
 
	
});
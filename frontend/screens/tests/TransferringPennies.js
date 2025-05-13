/**
 * Author: Maryna Kucher
 * Description: Main file for the Transferring Pennies Test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import { StyleSheet, View, Dimensions} from 'react-native';
import { useState, useEffect , useRef} from 'react';
import Penny from '../../shared/Penny.js';
import {sendRequest} from '../../shared/sendRequest.js';

import * as ScreenOrientation from "expo-screen-orientation";
import RulesModal from '../../shared/RulesModal.js';
import Timer from '../../shared/Timer.js';
import { useNavigation} from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';

export default function TransferringPennies() {

	const [rulesModal, setRulesModal] = useState(true); //round 1 modal
	const [round2Modal, setRound2Modal] = useState(false); //round 2 modal

	const navigation = useNavigation(); //used to navigate to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //used to update the auth flag based on server response

	const [timerIsRunning, setTimerIsRunning] = useState(false); //for timer handling

	const [coinData, setCoinData] = useState([]); //saves data that will be send to the backend


	const { width, height } = Dimensions.get('window');
	const minDimension = Math.min(width, height);

	//each coin has to be 10% of the drop area and the drop area is 60% of the screen 
	const coinSize = minDimension * 0.06;

   // array based on which coins are rendered
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

	//additional data about rounds that will be send to the backend
	const additionalData = useRef({
		timeStartRound1:0,
		timeEndRound1:0,
		timeStartRound2:0,
		timeEndRound2:0,
		width: 0,
	});

	const [round, setRound] = useState(1); // current round. can be 1 or 2

	const leftZoneRef = useRef(null); //ref on each zone, for coords measurement
	const rightZoneRef = useRef(null);

	const [leftZonePos, setLeftZonePos] = useState({ x: 0, y: 0 }); //saves zone position
	const [rightZonePos, setRightZonePos] = useState({ x: 0, y: 0 });

	//measure right and left zones position
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

	//measure the positions of the zones at each orientation change event
	useEffect(() => {
		const subscription = ScreenOrientation.addOrientationChangeListener((evt) => {
			measureZones();
		});
		
		return () => {
			ScreenOrientation.removeOrientationChangeListener(subscription);
		};
	}, []);
	
	//measure zones on first render
	useEffect(() => {
		measureZones();
	}, []);

	//measure game field width and convert to inches
	useEffect(() => {
		if (leftZonePos.width && rightZonePos.x) {
			const calculatedWidth = (rightZonePos.x - (leftZonePos.x + leftZonePos.width)) / 160;
			additionalData.current.width = calculatedWidth; //save in additional data structure
		}
	}, [leftZonePos, rightZonePos]);
	
	//check round completion after each coin update
	useEffect(() => {
		checkRoundCompletion(); 
	}, [elements]); 


    const checkRoundCompletion = () => {
		//check if all elements are in correct zone
		const allInZone = round === 1
			? elements.every(el => el.status === 'right')
			: elements.every(el => el.status === 'left');
	
		if (!allInZone) return;
		
		setTimerIsRunning(false); //stop the timer 
	
		if (round === 1) {
			additionalData.current.timeEndRound1 = Date.now();
			setRound(2); //go to the next round
			setRound2Modal(true); //show modal between rounds 
		} else if (round === 2) {
			additionalData.current.timeEndRound2 = Date.now();
			sendDataToBackend(); //end test and send data to the backend
		}
	};
	

	const distance = (point1, point2) => {
		//calculate distance between two dots
		return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	}
	
    // function to normalize hand_change_points before sending to the backend
	const normalizeData = (coinData) => {
		return coinData.map((coin) => {
            //get horizontal middle of the movement
			const lengthCoordX = Math.abs(coin.end_coordinates.x - coin.start_coordinates.x)
			const startX = coin.start_coordinates.x;
			const endX = coin.end_coordinates.x;

			// get movement direction
			const goingLeft = startX > endX;
			//check if it is array
			const points = Array.isArray(coin.hand_change_points) ? coin.hand_change_points : [];

			//delete extreme points that are <1/8 and >7/8 of the general path
			const extremePointsDeleted = points.filter((point) => {
				const relativeX = goingLeft
					? point.x -endX // movement to the left
					: point.x - startX; // movement to the right
			
				return relativeX > 0.125 * lengthCoordX && relativeX < 0.875 * lengthCoordX;
			});
            //merge points that are located really close and most likely were created in one hand changing move
			let i = 0;
            while (i < extremePointsDeleted.length - 1) {
                const point1 = extremePointsDeleted[i];
                const point2 = extremePointsDeleted[i + 1];

                if (distance(point1, point2) < coinSize.current) {
                    // merge two dots
                    extremePointsDeleted[i] = {
                        x: (point1.x + point2.x) / 2,
                        y: (point1.y + point2.y) / 2,
                        time: (point1.time + point2.time) / 2
                    };

                    // delete merged point
                    extremePointsDeleted.splice(i + 1, 1);
                } else {
                    
                    i++;
                }
            }

            //if there are more than one point left after merge, find closest to the middle
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

	//send data to the backend and show results
    const sendDataToBackend = async () => {
		//normalize data (selection of one hand change point)
		const normalizedData = normalizeData(coinData);
		
		const requestBody = {
			coinData : normalizedData,
            additionalData : additionalData.current
		}
		//send the request using a separate component from ../shared/directory
		await sendRequest({
			url: 'http://192.168.0.12:5000/api/result/pennies/saveResponse',
			body: requestBody,
			setIsAuthenticated,
			navigation,
			onSuccess: result => navigation.navigate('Results', { result })
		});
        
    };


    return (
        <View style={styles.container}>
			<RulesModal 
				visible={rulesModal} 
				rules='The test has two rounds. In the first round, use your left hand to take a coin from the left side, pass it to your right hand, and place it on the right side. Move all the coins as quickly as possible. The round ends automatically when all coins are transferred. Using a stylus is recommended.' 
				onClose={() => {
					setRulesModal(false);
					additionalData.current.timeStartRound1 = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			<RulesModal 
				visible={round2Modal} 
				rules='In the second round, do the same in reverse: use your right hand to pick up coins from the right side, pass them to your left hand, and place them on the left side.' 
				onClose={() => {
					setRound2Modal(false);
					additionalData.current.timeStartRound2 = Date.now();
					setTimerIsRunning(true);

				}} 
			/>

			
			<Timer isRunning={timerIsRunning} startTime={additionalData.current.timeStartRound1}/>

            <View style={styles.gameArea}>
			{/* Left zone  */}
            <View style={[styles.dropArea, {}]} ref={leftZoneRef}>
                
                {round === 1 && !rulesModal && elements.map((el) => (
                
				<Penny 
					key={el.id} 
					index={el.id} 
					setElements={setElements}
					checkRoundCompletion={checkRoundCompletion}
					round={round}
					setCoinData={setCoinData}
					targetZonePos={rightZonePos}
					coinSize={coinSize}
				/>
                ))}
            </View>
            {/* Right zone */}
            <View 
				style={[styles.dropArea,{zIndex: round}]} //z-index depends on round so target zone will not cover coin
				ref={rightZoneRef}
			>
                {round === 2 && elements.map((el) => (

                <Penny 
                    key={el.id} 
                    index={el.id} 
					setElements={setElements}
                    checkRoundCompletion={checkRoundCompletion}
                    round={round}
                    setCoinData={setCoinData}
					targetZonePos={leftZonePos}
					coinSize={coinSize}

                />                    
            ))}
            </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 0,

        backgroundColor: "#f5f5f5"
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
		height: '60%', //affect coin size calculation
        justifyContent: "space-between",
        paddingHorizontal: 20,
        position: "relative", 
    },
    dropArea: {
        width: '10%',
        height: '100%', 
        backgroundColor: "#d3d3d3",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        position: 'relative',
		flexDirection: 'col',
		flexWrap: 'wrap',
        zIndex: 2,
    },
 
	
});
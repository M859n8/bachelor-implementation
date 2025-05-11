import { StyleSheet, Text, View, Modal, Image, TextInput,  Dimensions } from 'react-native';
import { useState, useRef, useMemo  } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard} from 'react-native';
import CustomButton from '../../shared/CustomButton.js';
import RulesModal from '../../shared/RulesModal.js';
import ChoiceTask from '../../shared/ChoiceTask.js';
import {sendRequest} from '../../shared/sendRequest.js';

import { useContext } from 'react';
import { AuthContext } from '../../shared/AuthContext.js';

import { useNavigation } from '@react-navigation/native';


//array of images for first part of the test
const images1 = [
	{ index: 0, image: require('../../assets/visual_organiz/1.png') },
	{ index: 1, image: require('../../assets/visual_organiz/2.png') },
	{ index: 2, image: require('../../assets/visual_organiz/3.png') },
	{ index: 3, image: require('../../assets/visual_organiz/4.png') },
	{ index: 4, image: require('../../assets/visual_organiz/5.png') },
	{ index: 5, image: require('../../assets/visual_organiz/6.png') },
	{ index: 6, image: require('../../assets/visual_organiz/7.png') },
	{ index: 7, image: require('../../assets/visual_organiz/8.png') },
	{ index: 8, image: require('../../assets/visual_organiz/9.png') },
	{ index: 9, image: require('../../assets/visual_organiz/10.png') },
	{ index: 10, image: require('../../assets/visual_organiz/11.png') },
	{ index: 11, image: require('../../assets/visual_organiz/12.png') },
	{ index: 12, image: require('../../assets/visual_organiz/13.png') },
	{ index: 13, image: require('../../assets/visual_organiz/14.png') },
	{ index: 14, image: require('../../assets/visual_organiz/15.png') },
	{ index: 15, image: require('../../assets/visual_organiz/16.png') },
	{ index: 16, image: require('../../assets/visual_organiz/17.png') },
	{ index: 17, image: require('../../assets/visual_organiz/18.png') },
	{ index: 18, image: require('../../assets/visual_organiz/19.png') },
	{ index: 19, image: require('../../assets/visual_organiz/20.png') },
	{ index: 20, image: require('../../assets/visual_organiz/21.png') },
	{ index: 21, image: require('../../assets/visual_organiz/22.png') },
	{ index: 22, image: require('../../assets/visual_organiz/23.png') },
	{ index: 23, image: require('../../assets/visual_organiz/24.png') },
	{ index: 24, image: require('../../assets/visual_organiz/25.png') },
];
  //images for second part of the test (multiple-choice)
const images2 = [
	{ index: 26, image: require('../../assets/visual_organiz/26.png')},
	{ index: 27, image: require('../../assets/visual_organiz/27.png')},
	{ index: 28, image: require('../../assets/visual_organiz/28.png')},
	{ index: 29, image: require('../../assets/visual_organiz/29.png')},
	{ index: 30, image: require('../../assets/visual_organiz/30.png')},
	{ index: 31, image: require('../../assets/visual_organiz/31.png')},
	{ index: 32, image: require('../../assets/visual_organiz/32.png')},
	{ index: 33, image: require('../../assets/visual_organiz/33.png')},
];
	
  
export default function VisualOrganization() {
	const navigation = useNavigation(); //using for navigation to the result page
	const { setIsAuthenticated } = useContext(AuthContext); //using for updating auth flag based on server response
	const [rulesModal, setRulesModal] = useState(true); //rules at the start of the test


	const [textResponse, setTextResponse] = useState(''); //for text field
	const inputRef = useRef(null); //ref on input field, for keybord activation

	const [isLoading, setIsLoading] = useState(false); //loading indicator for submit button
	const [currentImageIndex, setCurrentImageIndex] = useState(0); //current image
	const [showEmptyConfirm, setShowEmptyConfirm] = useState(false); //modal to confirm empty answer

	const testSet = useRef([]); //set with test images

	const results = useRef([]); //correct results from multiple-choice task

	//calculate the image card size
	const { width, height } = Dimensions.get('window');
	const minDimension = Math.min(width, height);
	const cardSize = 0.4 * minDimension;

	//gets random indexes from array
	const getRandomSample = (array, count) => {
		return array
			.sort(() => Math.random() - 0.5) //shuffle the array randomly
			.slice(0, count); //select the first 'count' elements
	};
	
	//generates images for multiple-choice part of the test
	const generateChoices = (image) => {
		//get three random angles
		const possibleAngles = [0, 60, 120, 180, 240, 300];
		const shuffledAngles = possibleAngles.sort(() => Math.random() - 0.5);
		const angles = shuffledAngles.slice(0, 3);

		//create three rotated(incorrect variants) 
		const rotatedChoices = angles.map((angle) => ({
			image,
			transform: [{ rotate: `${angle}deg` }],
			isCorrect: false,
		}));

		//create a correct (reversed) variant
		const mirroredChoice = {
			image,
			transform: [{ scaleX: -1 }, { rotate: `${Math.floor(Math.random() * 360)}deg` }],
			isCorrect: true,
		};
	
		// Combine and shuffle
		const allChoices = [...rotatedChoices, mirroredChoice].sort(() => Math.random() - 0.5);
	
		//find index of the correct answer
		const correctIndex = allChoices.findIndex(choice => choice.isCorrect);
	
		return {
			choices: allChoices,
			correctIndex,
		};
	};
	
	//generates test set 
	const generateTestSet = () => {
		//images with text input
		const selectedFromImages1 = getRandomSample(images1, 5).map((item, i) => ({
			type: 'text',
			image: item.image,
			index: item.index,
			answer: '',
		}));
		//images with multiple-choice
		const selectedFromImages2 = getRandomSample(images2, 5).map((item) => {
			const { choices, correctIndex } = generateChoices(item.image);
			return {
				type: 'choice',
				image: item.image,
				index: item.index,
				choices, 
				correctIndex,
				selectedChoice: null,
			};
		});
		
		//merge
		const combinedTasks = [...selectedFromImages1, ...selectedFromImages2];

		return combinedTasks

	};
	testSet.current = useMemo(() => generateTestSet(), []);

	//after each text answer handle submit
	const handleSubmit = async (id, sendEmpty = false) => {
		//check if testresponse is not empty
		if (!textResponse.trim() && !sendEmpty) {
			//show modal if response is empty 
			setShowEmptyConfirm(true);
			return;
		}
		//update results
		results.current.push({
			index: id,
			type: 'text',
			userAnswer: textResponse,
		});
		
		//go to the next image
		if (currentImageIndex < testSet.current.length-1) {
			
			setCurrentImageIndex(currentImageIndex + 1); 
			setTextResponse(''); //clear response field
		} else {
			//if it is last image
			sendToBackend(); 
		}
	
	};

	//after each multiple-choice answer
	const handleChoiceSelect = (choiceIndex) => {
		//check if it was correct
		const currentTask = testSet.current[currentImageIndex];
		const isCorrect = choiceIndex === currentTask.correctIndex;
		//update results
		results.current.push({
			index: currentTask.index,
			type: 'multichoice',
			isCorrect: isCorrect,
		});
	
		// go to the next task
		if (currentImageIndex < testSet.current.length - 1) {
			setCurrentImageIndex(currentImageIndex + 1); //go to next img

		} else {
			//send data to the backend after last task
			sendToBackend(); 
		}
	};
	
  

    const sendToBackend = async () => {
		await sendRequest({
			url: 'http://192.168.0.12:5000/api/result/visual/saveResponse',
			body: {userAnswers: results.current},
			setIsAuthenticated,
			onSuccess: result => {Keyboard.dismiss(); navigation.navigate('Results', { result })}
		});
    };

    return (
    <View style={styles.container}>
		<RulesModal 
			visible={rulesModal} 
			rules='The pictures shows an object divided into parts. Write the name of the object you see in English. In the second half of the test, among four pictures in different positions, you will need to choose one that is mirrored.' 
			onClose={() => {setRulesModal(false);inputRef.current?.focus();}} 
		/>

		<Modal //in case of empty answer ask for a confirmation
			transparent={true}
			animationType="fade"
			visible={showEmptyConfirm}
			onRequestClose={() => setShowEmptyConfirm(false)}
		>
			<View style={styles.modalOverlay}>
			<View style={styles.modalContainer}>
				<Text style={styles.modalTitle}>Send an empty answer?</Text>
				<View style={styles.buttonRow}>
					<CustomButton
						title="Cancel"
						onPress={() => {
							setShowEmptyConfirm(false); 
						}}
						
					/>
					<CustomButton
						title="Send"
						onPress={() => {
							setShowEmptyConfirm(false);
							handleSubmit(testSet.current[currentImageIndex].index, true);
						}}
					/>
				</View>
			</View>
			</View>
		</Modal>
		{!rulesModal && ( //after rules are closed
		<KeyboardAvoidingView //activate keyboard
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<View style={styles.mainZone}>
				<Text style={styles.counter}>{currentImageIndex} / {testSet.current.length-1} </Text>
			
				{testSet.current[currentImageIndex].type === 'text' ? ( //render tests based on type
					<>
						<View style={styles.card}>
							<Image 
								source={testSet.current[currentImageIndex].image} 
								style={[styles.image, {width: cardSize, height: cardSize}]} 
								resizeMode="contain"
							/>
						</View>
						<TextInput
							value={textResponse}
							ref={inputRef}
							onChangeText={setTextResponse}
							placeholder="Enter your answer"
							style = {styles.textInput}
						/>
					
					
						<CustomButton
							title="Send"
							onPress={()=> handleSubmit(testSet.current[currentImageIndex].index) }
							isLoading={isLoading}
						/>
					</>
				) : (
					<ChoiceTask 
						task={testSet.current[currentImageIndex]}
						onSelect={(choiceIndex) => handleChoiceSelect(choiceIndex)}

					/>
				)}

				
			</View>
		</ScrollView>
		</KeyboardAvoidingView>)}
      </View>
  );
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#f5f5f5'
	},
	screenText: {
		fontSize: 24
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '80%',
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 12,
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 20,
		textAlign: 'center',
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 10, 
	},
	mainZone: {
		padding: '105'

	},
	card: {
		borderRadius: 6,
		elevation: 3,
		backgroundColor: '#fff',
		shadowOffset: { width: 1, height: 1 },
		shadowColor: '#333',
		shadowOpacity: 0.3,
		shadowRadius: 2,
		marginHorizontal: 4,
		marginVertical: 6,
		alignItems:'center'
	},
	image: {
		width: '100%', 
		
	},
	textInput: {
		padding: 5,
		fontSize: 22,
		backgroundColor: '#fff',
		borderRadius: 5,
	},
	counter: {
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#333',
		marginBottom: 10,
	}
 
});
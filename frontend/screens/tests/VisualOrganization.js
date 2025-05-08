
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Button, Text, View, Modal, Image, TextInput, Alert, Dimensions } from 'react-native';
import { useState, useEffect, useRef, useMemo  } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import CustomButton from '../../shared/CustomButton.js';
import RulesModal from '../../shared/RulesModal.js';
import ChoiceTask from '../../shared/ChoiceTask.js';


import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

//array of images
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

  const images2 = [
	// { index: 25, image: require('../../assets/visual_organiz/spatial.jpeg')},
	// { index: 26, image: require('../../assets/visual_organiz/26.png')},
	// { index: 27, image: require('../../assets/visual_organiz/27.png')},
	// { index: 28, image: require('../../assets/visual_organiz/28.png')},
	// { index: 29, image: require('../../assets/visual_organiz/29.png')},
	{ index: 30, image: require('../../assets/visual_organiz/30.png')},
	{ index: 31, image: require('../../assets/visual_organiz/31.png')},
	{ index: 32, image: require('../../assets/visual_organiz/32.png')},
	{ index: 33, image: require('../../assets/visual_organiz/33.png')},

  ];
  
  

export default function VisualOrganization() {
	const navigation = useNavigation(); 

	const [textResponse, setTextResponse] = useState(''); //for text field
	const [isLoading, setIsLoading] = useState(false); //loading indicator
	const inputRef = useRef(null); //ref on input field
	const [currentImageIndex, setCurrentImageIndex] = useState(0); //current image
	const [rulesModal, setRulesModal] = useState(true); //
	const [showEmptyConfirm, setShowEmptyConfirm] = useState(false); //modal to confirm empty answer

	// const [visualClosureArray, setVisualClosureArray ] = useState([])
	// const [spatialRelationsArray, setSpatialRelationsArray ] = useState([])
	const testSet = useRef([]);

	const visualClosureAnswers = useRef([]); //ref for user answers
	const spatialRelationsAnswers = useRef([]); 

	const results = useRef([]);

	//calculate the card size
	const { width, height } = Dimensions.get('window');
	const minDimension = Math.min(width, height);
	const cardSize = 0.4*minDimension;

	const getRandomSample = (array, count) => {
		const copy = [...array];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy.slice(0, count);
	};
	const generateChoices = (image) => {
		const possibleAngles = [0, 60, 120, 180, 240, 300];
		const shuffledAngles = possibleAngles.sort(() => Math.random() - 0.5);
		const angles = shuffledAngles.slice(0, 3);

		const rotatedChoices = angles.map((angle) => ({
			image,
			transform: [{ rotate: `${angle}deg` }],
			isCorrect: false,
		}));

		// Правильний варіант – дзеркально відображена
		const mirroredChoice = {
			image,
			transform: [{ scaleX: -1 }, { rotate: `${Math.floor(Math.random() * 360)}deg` }],
			isCorrect: true,
		};
	
		// Об’єднуємо та перемішуємо
		const allChoices = [...rotatedChoices, mirroredChoice];
		for (let i = allChoices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
		}
	
		// Знаходимо індекс правильної відповіді
		const correctIndex = allChoices.findIndex(choice => choice.isCorrect);
	
		return {
			choices: allChoices,
			correctIndex,
		};
	};
	

	const generateTestSet = () => {

		// const selectedFromImages1 = getRandomSample(images1, 5).map((item, i) => ({
		// 	type: 'text',
		// 	image: item.image,
		// 	index: item.index,
		// 	answer: '',
		// }));
		
		const selectedFromImages2 = getRandomSample(images2, 5).map((item) => {
			const { choices, correctIndex } = generateChoices(item.image);
			// Тут можна пізніше згенерувати варіанти з поворотами/дзеркальними копіями
			return {
				type: 'choice',
				image: item.image,
				index: item.index,
				choices, 
				correctIndex,
				selectedChoice: null,
			};
		});
		
		// Об’єднуємо, можна також перемішати фінальний масив
		// const combinedTasks = [...selectedFromImages1, ...selectedFromImages2];
		const combinedTasks = [ ...selectedFromImages2];

		console.log('test set', combinedTasks); 
		return combinedTasks

	};
	// const testSet = useRef(generateTestSet());
	testSet.current = useMemo(() => generateTestSet(), []);



	// useEffect(() => {
	// 	// setVisualClosureArray(shuffleArray(images1))
	// 	// setSpatialRelationsArray(shuffleArray(images2))
	// 	testSet.current = generateTestSet()

	// }, [rulesModal])
	const handleSubmit = async (id, sendEmpty = false) => {
		console.log('got to handle submit')

		// setIsLoading(true);
		if (!textResponse.trim() && !sendEmpty) {
			console.log('empty text')
			//show modal if response is empty 
			setShowEmptyConfirm(true);
			return;
		}
		results.current.push({
			index: id,
			type: 'text',
			userAnswer: textResponse,
		});
		
		// submitResult();
		if (currentImageIndex < testSet.current.length-1) {
			
			setCurrentImageIndex(currentImageIndex + 1); //go to next img
			setTextResponse(''); //clear response field
		} else {
			sendToBackend(); 
		}
	
	};

	//go to next image or send data to backend
	// const submitResult = () => {
		
	// 	if (currentImageIndex < testSet.current.length-1) {
	// 		//save user answer
	// 		console.log('test responce', textResponse)
	// 		visualClosureAnswers.current.push(textResponse);
	// 		setIsLoading(false); //end liading status
	// 		setCurrentImageIndex(currentImageIndex + 1); //go to next img
	// 		setTextResponse(''); //clear response field
	// 	} else {
	// 		sendToBackend(); 
	// 	}
	// };
	const handleChoiceSelect = (choiceIndex) => {
		const currentTask = testSet.current[currentImageIndex];
	
		const isCorrect = choiceIndex === currentTask.correctIndex;
	
		results.current.push({
			index: currentTask.index,
			type: 'multichoice',
			isCorrect: isCorrect,
		});
	
		// Переходимо до наступного завдання
		if (currentImageIndex < testSet.current.length - 1) {
			// setCurrentImageIndex(prev => prev + 1);
			setCurrentImageIndex(currentImageIndex + 1); //go to next img

		} else {
			console.log('got to else')
			// Можеш тут викликати submitResult або показати фінальний екран
			sendToBackend(); 
		}
	};
	
  

    const sendToBackend = async () => {
		try {
			const token = await AsyncStorage.getItem('authToken');
			setIsLoading(true);  //start loading process untill we got data from backend
			
			const response = await fetch('http://192.168.0.12:5000/api/result/saveResponse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					userAnswers: results.current, 
				}),
			});
	
			const result = await response.json();
	
			if (response.ok) {
				// setResults(result); //save results
				Keyboard.dismiss();
				// setResultsModal(true); //show results modal
				navigation.navigate('Results', { result });

			}
		} catch (error) {
			
			Alert.alert('Error', 'Sending results to backend');
		}finally {
			setIsLoading(false);
		}
    };

  return (
      <View style={styles.container}>
     

		 {/* Модальне вікно */}
		<RulesModal 
			visible={rulesModal} 
			rules='The pictures shows an object divided into parts. Enter the name of the object in the test field' 
			
			onClose={() => {setRulesModal(false);inputRef.current?.focus();}} 
		/>

		<Modal
			transparent={true}
			animationType="fade"
			visible={showEmptyConfirm}
			onRequestClose={() => setShowEmptyConfirm(false)}
		>
		<View style={styles.modalOverlay}>
			<View style={styles.modalContainer}>
			<Text style={styles.modalTitle}>Надіслати порожню відповідь?</Text>
			<View style={styles.buttonRow}>
				<CustomButton
					title="Cancel"
					onPress={() => {
						setShowEmptyConfirm(false); 
						// setIsLoading(false);
					}}
					buttonStyle={{ width: '40%' }}
					
				/>
				<CustomButton
					title="Send"
					onPress={() => {
						setShowEmptyConfirm(false);
						// submitResult();
						handleSubmit(testSet.current[currentImageIndex].index, true);
					}}
					buttonStyle={{ width: '40%' }}
				/>
			</View>
			</View>
		</View>
		</Modal>
		{!rulesModal && (
		<KeyboardAvoidingView 
		behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		style={{ flex: 1 }}
		>
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<View style={styles.mainZone}>
				<Text>{currentImageIndex} / {testSet.current.length-1} </Text>
			
				{testSet.current[currentImageIndex].type === 'text' ? (
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
		//   justifyContent: 'center',
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
		gap: 10, // якщо підтримується, або можеш використати marginRight у першої кнопки
	},
	mainZone: {
		padding: '105'

	},
	card: {
		// width: '60%', // конкретний розмір картки
		// height: '60%', // конкретний розмір картки
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
		width: '100%', // картинка займатиме всю ширину картки
		// height: '100%', // картинка займатиме всю висоту картки
		
	},
	textInput: {
		padding: 5,
		fontSize: 22,
		backgroundColor: '#fff',
		borderRadius: 5,
	},
 
 
});
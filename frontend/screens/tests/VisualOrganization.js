
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Button, Text, View, Modal, Image, TextInput, Alert, Dimensions } from 'react-native';
import { useState, useEffect, useRef  } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import CustomButton from '../../shared/CustomButton.js';
import ResultsModal from '../../shared/resultsModal.js';
import RulesModal from '../../shared/RulesModal.js';


import AsyncStorage from '@react-native-async-storage/async-storage';

// Масив зображень, що відповідають файлам
const images = [
	require('../../assets/visual_organiz/1.png'),
	require('../../assets/visual_organiz/2.png'),
	require('../../assets/visual_organiz/3.png'),
	require('../../assets/visual_organiz/4.png'),
	require('../../assets/visual_organiz/5.png'),
	require('../../assets/visual_organiz/6.png'),
	require('../../assets/visual_organiz/7.png'),
	require('../../assets/visual_organiz/8.png'),
	require('../../assets/visual_organiz/9.png'),
	require('../../assets/visual_organiz/10.png'),
	require('../../assets/visual_organiz/11.png'),
	require('../../assets/visual_organiz/12.png'),
	require('../../assets/visual_organiz/13.png'),
	require('../../assets/visual_organiz/14.png'),
	require('../../assets/visual_organiz/15.png'),
	require('../../assets/visual_organiz/16.png'),
	require('../../assets/visual_organiz/17.png'),
	require('../../assets/visual_organiz/18.png'),
	require('../../assets/visual_organiz/19.png'),
	require('../../assets/visual_organiz/20.png'),
	require('../../assets/visual_organiz/21.png'),
	require('../../assets/visual_organiz/22.png'),
	require('../../assets/visual_organiz/23.png'),
	require('../../assets/visual_organiz/24.png'),
	require('../../assets/visual_organiz/25.png'),
  ];
  

export default function VisualOrganization() {

	const [textResponse, setTextResponse] = useState(''); // Для вводу тексту

	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef(null);
	// const images = [1, 2, 3, 4, 5]; // Масив зображень
	const [currentImageIndex, setCurrentImageIndex] = useState(0); // Поточний індекс зображення

	const [resultsModal, setResultsModal] = useState(false);
	const [results, setResults] = useState({ finalScore: 100 });
	const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

	const [rulesModal, setRulesModal] = useState(true);
	const answersRef = useRef([]);
	// const currentAnswerRef = useRef('');
	const { width, height } = Dimensions.get('window');
	const minDimension = Math.min(width, height);
	const cardSize = 0.4*minDimension;

  // const image_id = 1; // Ідентифікатор картинки

	// useEffect(() => {
	// 	// console.log(' isLoading changed:', isLoading);
	// }, [isLoading]); // Після зміни isLoading, логувати його значення

	// useEffect(() => {
	// 	if(!rulesModal && !resultsModal){
	// 		inputRef.current?.focus();
	// 	}
	//   }, [currentImageIndex]);

	const handleSubmit = async () => {
		// Keyboard.dismiss(); //DONT WORKING !!!!
		setIsLoading(true);

		if (!textResponse.trim()) {
			setShowEmptyConfirm(true);
			return;
		}
		// inputRef.current?.focus();
		// if (currentImageIndex < images.length-1) {
		// 	answersRef.current.push(textResponse);
		// 	// answersRef.current.push(currentAnswerRef.current);
		// 	setCurrentImageIndex(currentImageIndex + 1); // Перехід до наступного зображення
		// 	setTextResponse(''); 
		// } else {
		// 	sendToBackend(); // Викликаємо функцію для отримання результатів
		// }
		submitResult();
	
	};
	const submitResult = () => {
		// inputRef.current?.focus();
		if (currentImageIndex < images.length-1) {
			answersRef.current.push(textResponse);
			// answersRef.current.push(currentAnswerRef.current);
			setIsLoading(false);

			setCurrentImageIndex(currentImageIndex + 1); // Перехід до наступного зображення
			setTextResponse(''); 
		} else {
			sendToBackend(); // Викликаємо функцію для отримання результатів
		}
	};
  

    // Функція для отримання результатів після завершення всіх картинок
    const sendToBackend = async () => {
		try {
			const token = await AsyncStorage.getItem('authToken');
			setIsLoading(true);  // Тільки зараз починаємо показувати завантаження
			
			const response = await fetch('http://192.168.0.12:5000/api/result/saveResponse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					answersArr: answersRef.current, // Поточне зображення
				}),
			});
	
			const result = await response.json();
	
			if (response.ok) {
				setResults(result); // Зберігаємо результати
				Keyboard.dismiss();
				setResultsModal(true); // Показуємо картку з результатами
			}
		} catch (error) {
			// console.error('Помилка при отриманні результатів:', error);
			Alert.alert('Error', 'Sending results to backend');
		}finally {
			setIsLoading(false);
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
        {/* {resultsModal ? (
        <View style={styles.card} >
          <Text>Results:</Text>
          <Text style={styles.screenText}>{results.finalScore}</Text> 
        </View> */}

		 {/* Модальне вікно */}
		<RulesModal 
			visible={rulesModal} 
			rules='The pictures shows an object divided into parts. Enter the name of the object in the test field' 
			
			onClose={() => {setRulesModal(false);inputRef.current?.focus();}} 
		/>
		<ResultsModal 
			visible={resultsModal} 
			results={results} 
			onClose={() => setResultsModal(false)} 
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
						setIsLoading(false);
					}}
					style={{ width: '40%' }}
					
				/>
				<CustomButton
					title="Send"
					onPress={() => {
						setShowEmptyConfirm(false);
						submitResult();
					}}
					style={{ width: '40%' }}
				/>
			</View>
			</View>
		</View>
		</Modal>
		{/* allows to scroll img if keyboard covers it */}
		<KeyboardAvoidingView 
		behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		style={{ flex: 1 }}
		>
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<View style={styles.mainZone}>
				<Text>{currentImageIndex} / {images.length-1} </Text>
				<View style={styles.card}>
					<Image 
						source={images[currentImageIndex]} 
						style={[styles.image, {width: cardSize, height: cardSize}]} 
						resizeMode="contain"
					/>
				</View >
				<TextInput
					value={textResponse}
					ref={inputRef}
					onChangeText={setTextResponse}
					placeholder="Enter your answer"
					style = {styles.textInput}
				/>
			
				<CustomButton
					title="Send"
					onPress={handleSubmit}
					isLoading={isLoading}
					/>
			</View>
		</ScrollView>
		</KeyboardAvoidingView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
    //   justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
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
  },
 
 
});
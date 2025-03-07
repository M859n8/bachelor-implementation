
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, TextInput, Alert } from 'react-native';
import { useState, useEffect  } from 'react';

import Card from '../../shared/Card.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Масив зображень, що відповідають файлам
const images = {
  1: require('../../assets/visual_organiz/1.png'),
  2: require('../../assets/visual_organiz/2.png'),
  3: require('../../assets/visual_organiz/3.png'),
  4: require('../../assets/visual_organiz/4.png'),
  5: require('../../assets/visual_organiz/5.png'),
};


export default function VisualOrganization({route}) {
  const [modalVisible, setModalVisible] = useState(true);

  const [textResponse, setTextResponse] = useState(''); // Для вводу тексту
  const [isLoading, setIsLoading] = useState(false);

  // const images = [1, 2, 3, 4, 5]; // Масив зображень
  const [currentImageIndex, setCurrentImageIndex] = useState(1); // Поточний індекс зображення

  const [showResults, setShowResults] = useState(false); // Показувати результати
  const [results, setResults] = useState(null); // Збереження результатів

  // const image_id = 1; // Ідентифікатор картинки

  useEffect(() => {
    console.log(' isLoading changed:', isLoading);
  }, [isLoading]); // Після зміни isLoading, логувати його значення

  const handleSubmit = async () => {
    if (!textResponse) {
      Alert.alert('Помилка', 'Будь ласка, введіть відповідь!');
      return;
    }

    const token = await AsyncStorage.getItem('authToken');
    setIsLoading(true);  // Тільки зараз починаємо показувати завантаження

    try {
      const response = await fetch('http://localhost:5000/api/result/saveResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_id: currentImageIndex, // Поточне зображення
          text_response: textResponse,
        }),
      });
     
      const result = await response.json();

      if (response.ok) {
        Alert.alert('Успіх', 'Ваша відповідь успішно надіслана!');
        // Оновлюємо індекс для наступного зображення
          // Оновлюємо індекс для наступного зображення
          if (currentImageIndex < Object.keys(images).length) {
            setCurrentImageIndex(currentImageIndex + 1); // Перехід до наступного зображення
          } else {
            Alert.alert('Успіх', 'Це була остання картинка!');
            fetchResults(); // Викликаємо функцію для отримання результатів
          }
      } else {
        Alert.alert('Помилка', 'Щось пішло не так. Спробуйте знову.');
      }
    } catch (error) {
      console.error('Помилка при відправці:', error);
      Alert.alert('Помилка', 'Не вдалося надіслати відповідь. Перевірте з’єднання!');
    } finally {
      setIsLoading(false);
    }
  };

    // Функція для отримання результатів після завершення всіх картинок
    const fetchResults = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        
        const response = await fetch('http://localhost:5000/api/result/calculateResults', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          setResults(result); // Зберігаємо результати
          setShowResults(true); // Показуємо картку з результатами
        } else {
          Alert.alert('Помилка', 'Не вдалося отримати результати. Спробуйте знову.');
        }
      } catch (error) {
        console.error('Помилка при отриманні результатів:', error);
        Alert.alert('Помилка', 'Не вдалося отримати результати. Перевірте з’єднання!');
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
        {showResults ? (
        <View>
          <Text>Результати:</Text>
          <Text>{JSON.stringify(results)}</Text> 
        </View>
        ) : (
          <>
            <Card>
              <Image source={images[currentImageIndex]} />
            </Card >
            <TextInput
              value={textResponse}
              onChangeText={setTextResponse}
              placeholder="Введіть вашу відповідь"
            />
            <Button
              title={isLoading ? 'Завантаження...' : 'Відправити'}
              onPress={handleSubmit}
              disabled={isLoading}
            />
          </>
      )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
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
  }
});

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
  6: require('../../assets/visual_organiz/6.png'),
  7: require('../../assets/visual_organiz/7.png'),
  8: require('../../assets/visual_organiz/8.png'),
  9: require('../../assets/visual_organiz/9.png'),
  10: require('../../assets/visual_organiz/10.png'),
  11: require('../../assets/visual_organiz/11.png'),
  12: require('../../assets/visual_organiz/12.png'),
  13: require('../../assets/visual_organiz/13.png'),
  14: require('../../assets/visual_organiz/14.png'),
  15: require('../../assets/visual_organiz/15.png'),
  16: require('../../assets/visual_organiz/16.png'),
  17: require('../../assets/visual_organiz/17.png'),
  18: require('../../assets/visual_organiz/18.png'),
  19: require('../../assets/visual_organiz/19.png'),
  20: require('../../assets/visual_organiz/20.png'),
  21: require('../../assets/visual_organiz/21.png'),
  22: require('../../assets/visual_organiz/22.png'),
  23: require('../../assets/visual_organiz/23.png'),
  24: require('../../assets/visual_organiz/24.png'),
  25: require('../../assets/visual_organiz/25.png'),
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
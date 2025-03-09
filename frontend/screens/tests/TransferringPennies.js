import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions, Animated, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import DopArea from '../../shared/DropArea.js';
import Penny from '../../shared/Penny.js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const coinSize = screenWidth * 0.05; // Розмір монетки (~15% ширини екрану)
const dropZoneWidth = screenWidth * 0.1;
const dropZoneHeight = screenHeight * 0.6;

export default function TransferringPennies({route}) {

  const [modalVisible, setModalVisible] = useState(true);

   // Масиви монеток для лівої і правої сторін
//    const [coinsL, setCoinsL] = useState([
//     { index: 1, status: 'left' },
//     { index: 2, status: 'left' },
//     { index: 3, status: 'left' },

	const [elements, setElements] = useState([
		{ id: 1, status: 'left' },
		{ id: 2, status: 'left' },
		{ id: 3, status: 'left' },
    // додаємо скільки потрібно монеток
  ]);
  const [coinsR, setCoinsR] = useState([]);

  const [activeCoin, setActiveCoin] = useState(null);
  const [round, setRound] = useState(1); // Стан для відстеження поточного раунду
  const [gameOver, setGameOver] = useState(false); // Стан для завершення гри

  const moveCoin = (id, newStatus) => {
    setElements((prevElements) => {
      console.log("Before update:", prevElements);
      
      const updatedElements = prevElements.map((el) =>
          el.id === id ? { ...el, status: newStatus } : el
      );
  
      console.log("After update:", updatedElements);

      // Викликаємо checkRoundCompletion ПІСЛЯ оновлення
    //   setTimeout(() => {
    //     checkRoundCompletion();
    // }, 0);
      
      return updatedElements;
  });
  
    // console.log(`new element ${id} new status ${newStatus}  round ${round}`);
    // {elements.map((el) => { console.log(`actual  elem ${el.id} ${el.status}`)  })}

    // useEffect(() => {
    //   console.log("Elements updated:", elements);
    // }, [elements]);
    
    

    
  };

  useEffect(() => {
    // console.log("Updated elements in component:", elements);
    checkRoundCompletion();
}, [elements]);  // Виконається, коли `elements` оновиться


  const checkRoundCompletion = () => {
    console.log('got here');
    {elements.map((el) => { console.log(`actual  elem ${el.id} ${el.status}`)})}

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
        // sendDataToBackend();

      }

    }else{
      console.log('still same');
    }
  };

  const sendDataToBackend = async (coinData) => {
    const token = await AsyncStorage.getItem('authToken');
    setIsLoading(true);  // Тільки зараз починаємо показувати завантаження

    try {
      const response = await fetch('http://localhost:5000/api/result/pennies/saveResults', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`

          },
          body: JSON.stringify(coinData),
      })
      if (response.ok) {
        Alert.alert('Успіх', 'Ваша відповідь успішно надіслана!');
      }
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося надіслати відповідь. Перевірте з’єднання!');

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
                    round={round}/>
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
                round={round}/>                    
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
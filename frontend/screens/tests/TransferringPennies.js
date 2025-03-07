import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image } from 'react-native';
import { useState } from 'react';
import DropArea from '../../shared/DropArea.js';
import Penny from '../../shared/Penny.js';



export default function TransferringPennies({route}) {

  const [modalVisible, setModalVisible] = useState(true);

   // Масиви монеток для лівої і правої сторін
//    const [coinsL, setCoinsL] = useState([
//     { index: 1, status: 'left' },
//     { index: 2, status: 'left' },
//     { index: 3, status: 'left' },

	const [elements, setElements] = useState([
		{ index: 1, status: 'left' },
		{ index: 2, status: 'left' },
		{ index: 3, status: 'left' },
    // додаємо скільки потрібно монеток
  ]);
  const [coinsR, setCoinsR] = useState([]);

  const [activeCoin, setActiveCoin] = useState(null);

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

          {/* <DropArea
              style={styles.dropAreaL}
              title="Drop Area (Left)"
              elements={coinsL}
              status="left"
			  setActiveCoin={setActiveCoin}
          />
          <DropArea
              style={styles.dropAreaR}
              title="Drop Area (Right)"
              elements={coinsR}
              status="right"
			  setActiveCoin={setActiveCoin}

          /> */}
		  <View style={styles.coinContainer}>
            {elements.map(
                (element, index) =>
                    (
                        <Penny key={index} index={element.index} setActiveCoin={setActiveCoin} />
                    )
            )}
        </View>
		{/* <h1> Active card {activeCoin}</h1> */}
		<Text>Active coin: {activeCoin !== null ? activeCoin : 'None'}</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
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

  dropAreaL: {

  },
  dropAreaR: {

  }
});
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, Dimensions } from 'react-native';
import { useState } from 'react';
import DropArea from '../../shared/DropArea.js';
import Penny from '../../shared/Penny.js';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const coinSize = screenWidth * 0.15; // Розмір монетки (~15% ширини екрану)

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
            <View style={styles.gameArea}>
            <View style={styles.dropArea}>
                <Text style={styles.areaText}>Ліва зона</Text>
                    {elements
                        .filter((el) => el.status === "left")
                        .map((el) => (
                            <Penny key={el.id} index={el.id} setActiveCoin={setActiveCoin} />
                        ))}
            </View>
            {/* Права зона для монеток */}
            <View style={styles.dropArea}>
                    <Text style={styles.areaText}>Права зона</Text>
                    {elements
                        .filter((el) => el.status === "right")
                        .map((el) => (
                            <Penny key={el.id} index={el.id} setActiveCoin={setActiveCoin} />
                        ))}
                </View>
            </View>
		{/* <h1> Active card {activeCoin}</h1> */}
		<Text>Active coin: {activeCoin !== null ? activeCoin : 'None'}</Text>
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, /*займає весь простів*/
        justifyContent: 'center', /*вирівнює центр по вертикалі*/
        alignItems: 'center', /* вирівнює по горизонталі*/
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
    },
    dropArea: {
        width: screenWidth * 0.4, // Ширина зон ~40% екрану
        height: screenHeight * 0.6, // Висота зони ~60% екрану
        backgroundColor: "#d3d3d3",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    areaText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
});
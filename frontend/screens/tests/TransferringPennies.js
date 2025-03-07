import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image } from 'react-native';
import { useState } from 'react';
import DropArea from '../../shared/DropArea.js';


export default function TransferringPennies({route}) {
  const [modalVisible, setModalVisible] = useState(true);
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
          {/* <Image source={require('../../assets/pennies/sideCoin.svg')} /> */}
          {/* <Image source={require('../../assets/pennies/penny.svg')} /> */}
          <DropArea title='Drop Area' elements='null'/>

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
  }
});
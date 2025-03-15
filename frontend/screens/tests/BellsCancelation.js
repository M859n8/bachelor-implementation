import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image } from 'react-native';
import { useState } from 'react';

import useTestObjects from '../../shared/GenerateBells.js'

export default function BellsCancelation({route}) {
    const [modalVisible, setModalVisible] = useState(true);
    
    const objects = useTestObjects();
    console.log(objects);
    
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
            </Modal>
            <Text style={styles.screenText}>{route.name} Screen</Text> */}
            {objects.map((img) => (
                <View key={img.id} style={[styles.bellImg, { left: img.x, top: img.y }]}>
                    <Image 
                        source={img.type === "bell" 
                            ? require("../../assets/pennies/frontCoin.png") 
                            : require("../../assets/pennies/sideCoin.png")} 
                        style={styles.image} 
                    />
                </View>
            ))}
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

    bellImg: {
        position: "absolute", // Фіксує положення на екрані
    },
    image: {
        width: 40,  // Розмір зображення (можна змінити)
        height: 40,
        resizeMode: "contain", // Адаптація зображення
    },
});
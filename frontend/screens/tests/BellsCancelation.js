import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, TouchableOpacity  } from 'react-native';
import { useState, useEffect } from 'react';

import useTestObjects from '../../shared/GenerateBells.js';



export default function BellsCancelation({route}) {
    const [modalVisible, setModalVisible] = useState(true);

    const imageMap = {
        0: require("../../assets/pennies/frontCoin.png"),
        1: require("../../assets/bells/processed_1.png"),
        2: require("../../assets/bells/processed_2.png"),
        3: require("../../assets/bells/processed_3.png"),
        4: require("../../assets/bells/processed_4.png"),
        5: require("../../assets/bells/processed_5.png"),
        6: require("../../assets/bells/processed_6.png"),
        7: require("../../assets/bells/processed_7.png"),
        8: require("../../assets/bells/processed_8.png"),
        9: require("../../assets/bells/processed_9.png"),
        10: require("../../assets/bells/processed_10.png"),
        11: require("../../assets/bells/processed_11.png"),
        12: require("../../assets/bells/processed_12.png"),
        13: require("../../assets/bells/processed_13.png"),
        14: require("../../assets/bells/processed_14.png"),
    };
    
    const objects = useTestObjects();
    // console.log(objects);

     // Стан для відслідковування натиснутого елементу
     const [clickedObjects, setClickedObjects] = useState([]);


    const handleImageClick = (id, x, y, type) => {
        // console.log(`got coords ${x}, ${y}`);
        // Якщо зображення типу 0, зберігаємо його координати та індекс
        if (type === 0) {
        console.log(`got coords ${x}, ${y}`);

            setClickedObjects((prev) => [...prev, { id, x, y }]);
        }
        // console.log(clickedObjects);
    };
    
    useEffect(()=>{
        console.log(clickedObjects);

    }, [clickedObjects]);

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
            {/* <View  style={styles.gameContainer}> */}
            {objects.map((img) => (
                <TouchableOpacity
                key={img.id}
                onPress={() => handleImageClick(img.id, img.x, img.y, img.type)} // Обробка натискання
                >

                    <View key={img.id} style={[styles.bellImg, { left: img.x, top: img.y }]}>
                        <Image 
                            source={imageMap[img.type] || require("../../assets/bells/processed_0.png")} 
                            style={[styles.image, img.type === 0 && { opacity: 0.5, textDecorationLine: 'line-through' }]} // Закреслюємо зображення} 
                        />
                    </View>
                </TouchableOpacity>
            ))}
            <Text>Touched bells {clickedObjects.x},  {clickedObjects.y}</Text>
            {/* </View> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
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
    }, 

    // gameContainer: {
    //     // flex: 1,
    //     padding: 10,
    // },

    bellImg: {

        position: "absolute", // Фіксує положення на екрані
    },
    image: {
        width: 50,  // Розмір зображення (можна змінити)
        height: 50,
        resizeMode: "contain", // Адаптація зображення
    },
});
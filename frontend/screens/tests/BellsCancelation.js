import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Button, Image, TouchableOpacity  } from 'react-native';
import { useState, useEffect } from 'react';

import useTestObjects from '../../shared/GenerateBells.js';
// import generateObjects from '../../shared/GenerateBells.js';

export default function BellsCancelation({route}) {
    const [modalVisible, setModalVisible] = useState(true);
    const [objects, setObjects] = useState(useTestObjects());
    const [gameOver, setGameOver] = useState(false); // Стан гри
    const [isLoading, setIsLoading] = useState(false); 


    const imageMap = {
        0: require("../../assets/bells/processed_0.png"),
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
    
    // const objects = useTestObjects();
    // setObjects(useTestObjects());


    console.log(objects);

     // Стан для відслідковування натиснутого елементу
     const [clickedObjects, setClickedObjects] = useState([]);



    const handleImageClick = (clickedImg) => {
        // console.log(`got coords ${x}, ${y}`);
        // Якщо зображення типу 0, зберігаємо його координати та індекс
        const existingIndex = clickedObjects.findIndex((image)=> {
            return clickedImg.id === image.id
        });
        if (clickedImg.type === 0 && existingIndex === -1) {
        console.log(`got coords ${clickedImg.x}, ${clickedImg.y}`);

            setClickedObjects((prev) => [...prev, { id: clickedImg.id, x: clickedImg.x, y: clickedImg.y, time: Date.now() }]); 

            setObjects((prevObjects) =>
                prevObjects.map((img) =>
                    img.id === clickedImg.id ? { ...img, touched: true } : img
                )
            );
        }
        // console.log(clickedObjects);
    };
    
    useEffect(()=>{
        console.log(clickedObjects);

    }, [clickedObjects]);

    const endGame = () => {
        // setGameOver(true);
        setIsLoading(true);

        
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
            {!gameOver ? (
            <>
                <View  style={styles.gameArea}>

                    {objects.map((img) => (
                        <TouchableOpacity
                        key={img.id}
                        onPress={() => handleImageClick(img)} // Обробка натискання
                        >
        
                            <View key={img.id} style={[styles.bellImg, { left: img.x, top: img.y }]}>
                                <Image 
                                    source={imageMap[img.type] || require("../../assets/bells/processed_0.png")} 
                                    style={[styles.image, img.touched && { opacity: 0.1}]} // Закреслюємо зображення} 
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <Button onPress={endGame} 
                        title={isLoading ? 'Loading ...' : 'End Game'}
                        disabled={isLoading}
                />
            </>

            ):(
                <View>
                <Text>Результати:</Text>
                {/* <Text>{JSON.stringify(results)}</Text>  */}
                
                </View>

            )}
            

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
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
        width: "95%", // Обмежуємо розмір ігрового поля
        height: "80%",
        backgroundColor: "white", // Фон для поля
        borderWidth: 2,
        borderColor: "black",
        position: "relative",
    },

    bellImg: {

        position: "absolute", // Фіксує положення на екрані
    },
    image: {
        width: 50,  // Розмір зображення (можна змінити)
        height: 50,
        resizeMode: "contain", // Адаптація зображення
    },
});
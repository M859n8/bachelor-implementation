import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ResultsModal({ visible, results, onClose }) {
    const navigation = useNavigation();

    return (
        <Modal animationType="slide" transparent={true} visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Results:</Text>
                    <Text style={styles.score}>{results?.finalScore}</Text>
                    <Button title="OK" onPress={() => {
                        onClose(); // Закриваємо модальне вікно
                        navigation.navigate('Home'); // Повертаємось на головний екран
                    }} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    score: {
        fontSize: 24,
        marginBottom: 20,
    },
});

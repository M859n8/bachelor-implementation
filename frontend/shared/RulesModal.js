import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RulesModal({ visible, rules, onClose }) {
    const navigation = useNavigation();

    return (
        <Modal animationType="slide" transparent={true} visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Rules:</Text>
                    <Text style={styles.score}>{rules}</Text>
                    <Button title="Start" onPress={() => {
                        onClose(); // Закриваємо модальне вікно
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

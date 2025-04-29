import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../shared/CustomButton.js';

export default function RulesModal({ visible, rules, onClose }) {
    const navigation = useNavigation();
	console.log('got here rules modal')

    return (
		<>
        {visible && (
			<View style={styles.overlay}>
			  <View style={styles.modalContainer}>
				<Text style={styles.title}>Rules:</Text>
				<Text style={styles.score}>{rules}</Text>
				<CustomButton title="Start" onPress={onClose} />
			  </View>
			</View>
		  )}
		</> 
    );
}

const styles = StyleSheet.create({
    // overlay: {
    //     position: 'absolute',
	// 	top: 0,
	// 	left: 0,
	// 	right: 0,
	// 	bottom: 0,
	// 	backgroundColor: 'rgba(0,0,0,0.5)', // затемнення фону
	// 	justifyContent: 'center',
	// 	alignItems: 'center',
	// 	zIndex: 1000,
    // },
    // modalContainer: {
    //     width: '80%',
    //     padding: 20,
    //     backgroundColor: 'white',
    //     borderRadius: 10,
    //     alignItems: 'center',
    // },
    // title: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 10,
    // },
    // score: {
    //     fontSize: 24,
    //     marginBottom: 20,
    // },
	overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // більше затемнення
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        paddingHorizontal: 20, // для малих екранів
    },
    modalContainer: {
        width: '100%',
        maxWidth: 350,
        padding: 24,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    rulesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
});

/**
 * Author: Maryna Kucher
 * Description: Rules component that appears at the beginning of each test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import React from 'react';
import {View, Text, StyleSheet } from 'react-native';
import CustomButton from '../shared/CustomButton.js';

//modal that is shown at the begining of each test
export default function RulesModal({ visible, rules, onClose }) {
   //used view instead of classic modal
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
   
	overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        paddingHorizontal: 20, 
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

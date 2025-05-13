/**
 * Author: Maryna Kucher
 * Description: Displays results of a after each test session.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '../shared/CustomButton.js';

export default function ResultsScreen() {
	const navigation = useNavigation(); //to navigate home
	const route = useRoute();
	const { result } = route.params || {}; //results from the backend

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.title}>Your Results</Text>
				<Text style={styles.score}>{result.finalScore}</Text>
	
				<CustomButton //navigation home
					title="Go Home"
					onPress={() => navigation.navigate('Home')}
					buttonStyle={{ backgroundColor: '#4B8A68'}}

				/>
			</View>
		</View>
	);
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		padding: 20,
	},
	card: {
		width: '90%',
		backgroundColor: '#E1EACD',
		borderRadius: 20,
		padding: 30,
		alignItems: 'center',
		shadowColor: '#8D77AB',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 6,
	},
	title: {
		fontSize: 36,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#4B8A68',
	},

	score: {
		fontSize: 30,
		fontWeight: 'bold',
		color: '#fff', 
		marginVertical: 20,
	},
});

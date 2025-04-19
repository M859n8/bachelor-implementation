import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ResultsScreen() {
	console.log('resultScreen')
	const navigation = useNavigation();
	const route = useRoute();
	const { result } = route.params || {};
	console.log('result', result, result.finalScore)

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Your Results</Text>
			<Text style={styles.score}>{result.finalScore}%</Text>

			<Button
				title="Go Home"
				onPress={() => navigation.navigate('Home')}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	score: {
		fontSize: 48,
		color: '#4CAF50',
		marginBottom: 40,
	},
});

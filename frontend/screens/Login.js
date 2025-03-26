import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from "./Home";

export default function Login({ setIsAuthenticated }) {
	const navigation = useNavigation(); // Ініціалізація навігації

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleLogin = async () => {
		try {
		const response = await fetch('http://192.168.0.12:5000/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await response.json();
		console.log("Received:", data);
		if (response.ok) {
			await AsyncStorage.setItem('authToken', data.token);  // зберігаємо токен
			Alert.alert('Success', 'Logged in successfully');
			console.log('Token:', data.token);
			setIsAuthenticated(true);
			// navigation.navigate('Home');
		} else {
			Alert.alert('Error', data.message || 'Login failed');
		}
		} catch (error) {
		Alert.alert('Error', 'Something went wrong');
		console.error(error);
		}
	};

	const handleRegister = async () => {
		try {
		const response = await fetch('http://192.168.0.12:5000/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await response.json();
		if (response.ok) {
			await AsyncStorage.setItem('authToken', data.token);  // зберігаємо токен

			Alert.alert('Success', 'Logged in successfully');
			console.log('Token:', data.token);
			setIsAuthenticated(true);
			// navigation.navigate('Home');
		} else {
			Alert.alert('Error', data.message || 'Login failed');
		}
		} catch (error) {
		Alert.alert('Error', 'Something went wrong');
		console.error(error);
		}
	};

	return (
		<View style={styles.container}>

			
			<TextInput
			placeholder="Username"
			value={username}
			onChangeText={setUsername}
			style={styles.input}
			/>
			<TextInput
			placeholder="Password"
			value={password}
			secureTextEntry
			onChangeText={setPassword}
			style={styles.input}
			/>
			<View style={styles.buttonContainer}>
				<Button title="Register" onPress={handleRegister} color='blue' />
				<Button title="Login" onPress={handleLogin} color='blue' />
			</View>

		</View>

	);
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			padding: '10%',
			backgroundColor: '#ccc',
		},
		input: {
			width: '100%',
			padding: 10,
			marginBottom: 10,
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 5,
			backgroundColor: '#fff',
		},
		buttonContainer: {
			width: '100%',
			gap: 10,
			// display: 'inline',
		},
	});
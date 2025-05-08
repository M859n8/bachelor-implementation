import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from "./Home";
import CustomButton from '../shared/CustomButton.js';

export default function Login({ setIsAuthenticated }) {
	const navigation = useNavigation(); // Ініціалізація навігації

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [handOrientation, setHandOrientation] = useState('right');
	const [isRegister , setIsRegister] = useState(false)
	const [age, setAge] = useState('');
	const hands = [
        { label: 'Right Hand', value: 'right' },
        { label: 'Left Hand', value: 'left' }
    ];


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
				Toast.show({
					type: 'success',
					text1: 'Logged in',
					text2: 'You have been logged in successfully.',
				});
				// console.log('Token:', data.token);
				setIsAuthenticated(true);
				// navigation.navigate('Home');
			} 
		} catch (error) {
			setIsRegister(true);

			Toast.show({
				type: 'error',
				text1: 'Log in error',
				text2:'Something went wrong',
			});
			// console.error(error);
		}
	};

	const handleRegister = async () => {
		setIsRegister(true)

		if (!username || !password || !age) {
			Toast.show({
				type: 'error',
				text1: 'Empty fields',
				text2: 'Please fill in all fields: username, password, and age.',
			});
			return; // Якщо одне з полів порожнє, не відправляємо запит
		}
		if (isNaN(age) || Number(age) <= 0) {
			Toast.show({
				type: 'error',
				text1: 'Invalid age',
				text2: 'Age must be a number greater than zero.',
			});
			return;
		}

		try {
			const response = await fetch('http://192.168.0.12:5000/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, age, handOrientation })
			});
			const data = await response.json();
			if (response.ok) {
				await AsyncStorage.setItem('authToken', data.token);  // зберігаємо токен

				Toast.show({
					type: 'success',
					text1: 'Register',
					text2: 'You have been registered successfully.',
				});
				console.log('Token:', data.token);
				setIsAuthenticated(true);
				// navigation.navigate('Home');
			} 
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Register error',
				text2:'Something went wrong',
			});
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

			{isRegister && (
				<>
					<TextInput
						placeholder="Age"
						value={age}
						onChangeText={setAge}
						keyboardType="numeric"
						style={styles.input}
					/>

			
			<View style={styles.handOrientation}>
					{hands.map((hand) => (
						<Pressable
							key={hand.value}
							onPress={() => setHandOrientation(hand.value)}
							style={styles.checkboxContainer}
						>
							<View style={[
								styles.checkbox,
								handOrientation === hand.value && styles.checkboxSelected
							]} />
							<Text style={styles.label}>{hand.label}</Text>
						</Pressable>
					))}
					</View>
				</>
			)}
			
			<View style={styles.buttonContainer}>
				{/* <Button title="Register" onPress={handleRegister} color='blue' /> */}
				<CustomButton
					title="Register"
					onPress={handleRegister}
					buttonStyle={{ backgroundColor: '#4CAF50', width: '80%' }}
					
				/>
				<CustomButton
					title="Login"
					onPress={handleLogin}
					buttonStyle={{ backgroundColor: isRegister ? '#ccc' : '#4CAF50' ,  width: '80%'}} 	
				/>
				{/* <Button title="Login" onPress={handleLogin} color='blue' /> */}
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
			// backgroundColor: '#FFFFFF',
			// backgroundColor: '#C4E3D7'
		backgroundColor: '#E1EACD'


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
			// width: '100%',
			flexDirection: 'row',
			justifyContent: 'center', // або 'center'
			alignItems: 'center',
			// gap: 10,
		},

		handOrientation: {
			flexDirection: 'row', 
			gap: 30, 
			padding: 12,
			borderRadius: 5,
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 5,
			backgroundColor: '#fff',
			

		},

		checkboxContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			
			// marginBottom: 10,
		},
		checkbox: {
			width: 20,
			height: 20,
			borderWidth: 2,
			borderColor: '#4CAF50',
			marginRight: 10,
			borderRadius: 4,
		},
		checkboxSelected: {
			backgroundColor: '#4CAF50',
		},
		label: {
			fontSize: 16,
		},
	});
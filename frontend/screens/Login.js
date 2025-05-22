/**
 * Author: Maryna Kucher
 * Description: Authentication screen for user login and registration.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React, { useState, useContext } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../shared/CustomButton.js';
import { AuthContext } from '../shared/AuthContext';

export default function Login() {
	const { setIsAuthenticated } = useContext(AuthContext);

	const [username, setUsername] = useState(''); //input data
	const [password, setPassword] = useState('');
	const [handOrientation, setHandOrientation] = useState('right');
	const [age, setAge] = useState('');


	const [isRegister , setIsRegister] = useState(false); //register or login state

	const hands = [ //for check box
        { label: 'Right Hand', value: 'right' },
        { label: 'Left Hand', value: 'left' }
    ];


	const handleLogin = async () => {
		try {
			//send login request to the backend
			const response = await fetch('http://localhost:5000/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error('Login failed');
			}

			await AsyncStorage.setItem('authToken', data.token);  //save the token
			Toast.show({
				type: 'success',
				text1: 'Logged in',
				text2: 'You have been logged in successfully.',
			});
			setIsAuthenticated(true);
			
		} catch (error) {
			setIsRegister(true);//if login returns error, user has to register

			Toast.show({
				type: 'error',
				text1: 'Log in error',
				text2:'Something went wrong',
			});
		}
	};

	const handleRegister = async () => {
		setIsRegister(true); 

		if (!username || !password || !age) { //check mandatory data
			Toast.show({
				type: 'error',
				text1: 'Empty fields',
				text2: 'Please fill in all fields: username, password, and age.',
			});
			return; // if any of the fields is empty
		}
		if (isNaN(age) || Number(age) <= 0) { //incorrect age format
			Toast.show({
				type: 'error',
				text1: 'Invalid age',
				text2: 'Age must be a number greater than zero.',
			});
			return;
		}

		try {
			//send register request to the backend
			const response = await fetch('http://localhost:5000/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password, age, handOrientation })
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error('Register failed');
			}
			await AsyncStorage.setItem('authToken', data.token);  //save the token

			Toast.show({
				type: 'success',
				text1: 'Register',
				text2: 'You have been registered successfully.',
			});
			setIsAuthenticated(true);
			
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

			{isRegister && ( //additional inputs for the register state
				<>
					<TextInput
						placeholder="Age"
						value={age}
						onChangeText={setAge}
						keyboardType="numeric"
						style={styles.input}
					/>

					{/* hand orientation checkbox */}
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
				<CustomButton
					title="Register"
					onPress={handleRegister}
					buttonStyle={{ backgroundColor: '#4CAF50', width: '80%' }}
					
				/>
				<CustomButton
					title="Login"
					onPress={handleLogin}
					buttonStyle={{ backgroundColor: isRegister ? '#adadad' : '#4CAF50' ,  width: '80%'}} 	
				/>
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
			backgroundColor: '#ccc'


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
			flexDirection: 'row',
			justifyContent: 'center', 
			alignItems: 'center',
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
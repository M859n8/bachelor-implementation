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
	

	return (
		<View style={styles.container}>
			
			<Text style={styles.text}> Please use the link with user authentication data to access the user page</Text>
			<Text  style={styles.link}> http://localhost:19006/?username=user1&email=ABC123&age=18 </Text>


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
		text: {
			fontSize: 20,
		},
		link: {
			fontSize: 16,
		}
		
	});
/**
 * Author: Maryna Kucher
 * Description: Context for managing and providing authentication state across the app.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false); 

	//send request to the backend and check authorization
	const checkAuth = async () => {
		const token = await AsyncStorage.getItem('authToken');
		
		if (!token) { //no token in local storage
			setIsAuthenticated(false);
			return;
		}
	
		try {
			const response = await fetch('http://localhost:5000/api/auth/check', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});
	
			if (response.status === 200) {
				setIsAuthenticated(true); // update auth status

			} else {
				setIsAuthenticated(false);

			}
		} catch (error) {
			setIsAuthenticated(false);
		}
	};
  

	
	//perform on first render
	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

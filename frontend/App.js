/**
 * Author: Maryna Kucher
 * Description: frontend entry point; sets up navigation, context providers, 
 * and wraps the app structure.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React from 'react';
import { SafeAreaView, Linking, Platform } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import Toast from 'react-native-toast-message';
import StackNavigator from "./StackNavigator";
import { AuthProvider, AuthContext } from './shared/AuthContext';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getParamsFromURL(url) {
    if (!url) return {};
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    const params = new URLSearchParams(queryString);
    return {
        login: params.get('login'),
        token: params.get('token'),
    };
}

function MainApp() {
	//get authentication status from context
	const { isAuthenticated, setIsAuthenticated } = React.useContext(AuthContext);

	// prevent rendering until auth status is determined
	if (isAuthenticated === null) return null; 
	useEffect(() => {
        const getInitialParams = async () => {
            let url;

            if (Platform.OS === 'web') {
                url = window.location.href;
            } else {
                url = await Linking.getInitialURL();
            }

            const { login, token } = getParamsFromURL(url);
            if (login && token) {
                // логіка логіну
                console.log('Login:', login);
                console.log('Token:', token);
				try {
					//send login request to the backend
					const response = await fetch('http://localhost:5000/api/auth/loginAuth', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ login })
					});
					const data = await response.json();
		
					if (!response.ok) {
						console.log('response not ok')
						throw new Error('Login failed');
					}else{
						console.log('response is ok', data)
					}
		
					await AsyncStorage.setItem('authToken', data.token);  //save the token
					console.log('data token', data.token)
					Toast.show({
						type: 'success',
						text1: 'Logged in',
						text2: 'You have been logged in successfully.',
					});
					setIsAuthenticated(true);
					
				} catch (error) {
		
					Toast.show({
						type: 'error',
						text1: 'Log in error',
						text2:'Something went wrong',
					});
				}
            }
        };

        getInitialParams();
    }, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<NavigationContainer>
				<StackNavigator isAuthenticated={isAuthenticated} />
				<Toast /> 
			</NavigationContainer>
		</SafeAreaView>
	);
}

export default function App() {
	return (
		<AuthProvider> 
			<MainApp />
		</AuthProvider>
	);
}


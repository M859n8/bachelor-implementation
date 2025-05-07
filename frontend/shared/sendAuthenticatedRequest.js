import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

export async function sendAuthenticatedRequest({
	url,
	method = 'POST',
	body = {},
	onSuccess,
	onUnauthorized,
	navigation,
	// setIsAuthenticated
}) {
	try {
		const token = await AsyncStorage.getItem('authToken');

		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		});

		if (response.status === 401) {
			await AsyncStorage.removeItem('authToken');
			// if (typeof setIsAuthenticated === 'function') {
			// 	setIsAuthenticated(false);
			// }
			if (typeof onUnauthorized === 'function') {
				onUnauthorized();
			}
			Toast.show({
				type: 'error',
				text1: 'Session expired',
				text2: 'Please log in again.'
			});
			return;
		}

		const result = await response.json();

		if (response.ok) {
			if (typeof onSuccess === 'function') {
				onSuccess(result);
			}
		} else {
			Toast.show({
				type: 'error',
				text1: 'Server returned an error',
			});
		}
	} catch (error) {

		Toast.show({
			type: 'error',
			text1:'Cannot send answers',
		});
	}
}

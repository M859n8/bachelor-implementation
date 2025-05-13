/**
 * Author: Maryna Kucher
 * Description: Send request function that sends test performance data 
 * to the backend and receives results.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

//function that passes data from tests to the backend and processes the result
export async function sendRequest({
	url,
	method = 'POST',
	body = {},
	onSuccess,
	navigation,
	setIsAuthenticated,
}) {

	try {
		//get token
		const token = await AsyncStorage.getItem('authToken');
		//send request
		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		});

		//if there is problems with authorization
		if (response.status === 401 || response.status === 403) {
			await AsyncStorage.removeItem('authToken');
			setIsAuthenticated(false); // update auth status
			
			Toast.show({
				type: 'error',
				text1: 'Session expired',
				text2: 'Please log in again.'
			});
			return;
		}

		const result = await response.json();

		if (response.ok) { //perform on success bechaviour
			//usually redirect to the result page
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

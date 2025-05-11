import React from 'react';
import { Button } from 'react-native-elements';

//creates custom button based on button from react native elements
export default function CustomButton({
	title,
	onPress,
	isLoading = false,
	buttonStyle = {},
	titleStyle = {},
	containerStyle = {},
	disabled = false,
  }) {
	return (
		<Button
			title={title}
			onPress={onPress}
			loading={isLoading}
			disabled={disabled}
			buttonStyle={{
				backgroundColor: '#4CAF50',
				borderRadius: 10,
				padding: 12,
				...buttonStyle, //add additional styles
			}}
			titleStyle={{
				fontWeight: 'bold',
				fontSize: 16,
				color: '#fff',
				...titleStyle,
			}}
			containerStyle={{
				marginVertical: 10,
				alignSelf: 'center',
				...containerStyle,
			}}
		/>
	);
  }
  
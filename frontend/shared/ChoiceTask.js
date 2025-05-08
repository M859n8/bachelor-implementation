import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';

const ChoiceTask = ({ task, onSelect }) => {
	console.log('choice task', task)
	return (
		<View style={{ gap: 10 }}>
			<View style={{ alignItems: 'center' }}>
				{/* <Image 
					source={task.image} 
					style={{ width: 200, height: 200, resizeMode: 'contain' }} 
				/> */}
				<Text>find flipped image </Text>
			</View>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
				{task.choices.map((choice, index) => (
					<TouchableOpacity key={index} onPress={() => onSelect(index)}>
						<Image 
							source={choice.image}
							style={{ width: 100, height: 100, margin: 15, transform: choice.transform }}
						/>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default ChoiceTask;

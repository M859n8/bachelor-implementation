/**
 * Author: Maryna Kucher
 * Description: Component for rendering multiple-choice tasks
 * from the Visual Organization Test.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';


const ChoiceTask = ({ task, onSelect }) => {
	return (
		<View style={{ gap: 10 }}>
			<View style={{ alignItems: 'center' }}>
			
				<Text style={styles.title}>Find flipped image</Text>
			</View>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
				{task.choices.map((choice, index) => ( //single variants
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
const styles = StyleSheet.create({
	title: {
		fontSize: 44,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#333',
		marginBottom: 10,
	},
  });
  
export default ChoiceTask;

/**
 * Author: Maryna Kucher
 * Description: Chart component for results visualization.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import Toast from 'react-native-toast-message';

//charts for results visualization on home page
export default function Chart({ testResults}) {

	const formatTestType = (str) => { //formate chart header
		return str
			.replace(/([a-z])([A-Z])/g, '$1 $2') 
			.replace(/\b\w/g, (char) => char.toUpperCase()); 
	};

	return (
	<ScrollView contentContainerStyle={{ padding: 16 }}>
		{Object.keys(testResults).length > 0 ? (
			Object.entries(testResults).map(([testType, rawData]) => {
				// to show detailed info about chart
				const data = rawData.map((item) => ({
					...item,
					onPress: () => {
						Toast.show({
							type: 'info',
							text1: `${item.label}`,
							text2: `Result: ${item.value}%`,
							position: 'bottom',
							visibilityTime: 2000,
						});
					},
				}));

				return (
					<View key={testType} style={{ marginBottom: 40 }}>
						<Text style={{ fontSize: 18, marginBottom: 10 }}>
							{formatTestType(testType)}
						</Text>

						<BarChart
							data={data}
							barWidth={25}
							spacing={20}
							roundedTop
							hideRules
							noOfSections={5}
							maxValue={100}
							yAxisTextStyle={{ color: '#888' }}
							xAxisLabelTextStyle={{ fontSize: 10 }}
						/>

						
					</View>
				);
			})
		) : (
			<Text>Can`t find results</Text>
		)}
				
			
	</ScrollView>
	);
};



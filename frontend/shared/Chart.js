// Chart.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart } from "react-native-gifted-charts";
import { useState, useRef, useEffect} from 'react';
import Toast from 'react-native-toast-message';

export default function Chart({ testResults}) {
	// console.log('got into chart with data', testResults)
	const [selectedInfo, setSelectedInfo] = useState(null);

	const formatTestType = (str) => {
		return str
			.replace(/([a-z])([A-Z])/g, '$1 $2') // додає пробіл перед великою літерою
			.replace(/\b\w/g, (char) => char.toUpperCase()); // кожне слово з великої
	};

	return (
	<ScrollView contentContainerStyle={{ padding: 16 }}>
		{Object.keys(testResults).length > 0 ? (
			Object.entries(testResults).map(([testType, rawData]) => {
				// додаємо onPress у кожен елемент
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

						{selectedInfo && (
							<Text style={{ marginTop: 10, fontSize: 14, color: '#333' }}>
								{selectedInfo.label}: {selectedInfo.value}
							</Text>
						)}
					</View>
				);
			})
		) : (
			<Text>Can`t find results</Text>
		)}
				
			
	</ScrollView>
	);
};



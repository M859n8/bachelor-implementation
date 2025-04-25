// Chart.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart } from "react-native-gifted-charts";

export default function Chart({ testResults}) {
	console.log('got into chart with data', testResults)

	return (
	<ScrollView contentContainerStyle={{ padding: 16 }}>
		{Object.keys(testResults).length > 0 ? (
			Object.entries(testResults).map(([testType, data])=> (
			<View key={testType} style={{ marginBottom: 40 }}>
			<Text style={{ fontSize: 18, marginBottom: 10 }}>{testType}</Text>
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

		))) : (
			<Text>Can`t find results</Text>
		)}
				
			
	</ScrollView>
	);
};



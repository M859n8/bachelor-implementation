import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet,ScrollView, useWindowDimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Login';
import Chart from '../shared/Chart.js';

const tests = [ "Balance","BellsCancellation","BlockDesign",
    "ComplexFigure","TransferringPennies", "VisualOrganization", "LineTracking"];

export default function Home({ setIsAuthenticated }) {

    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;

	const [userInfo, setUserInfo] = useState(null);
	const [testResults, setTestResults] = useState([]);
	const [chartData, setChartData] = useState([])

    const handleLogout = async () => {
		try {
			await AsyncStorage.removeItem('authToken'); // Видаляємо токен
			Alert.alert('Logged out', 'You have been logged out successfully.');
		
			setIsAuthenticated(false);  // Оновлюємо стан авторизації
			//   navigation.navigate('Login');
		} catch (error) {
			console.error('Logout error:', error);
			Alert.alert('Error', 'Something went wrong while logging out.');
		}
	};
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				console.log('got to fetch')
				const token = await AsyncStorage.getItem('authToken');
				console.log('token', token)
				const response = await fetch('http://192.168.0.12:5000/api/auth/user-info', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`

				},
				body: JSON.stringify([]),
				});
				const data = await response.json();
				// console.log(await response.text())
				if (response.ok) {
					console.log('data is', data.groupedResults)
					setUserInfo(data.user);
					setTestResults(data.groupedResults);
				}else{
					console.log('response is not ok')
				}
			} catch (error) {
				console.error('Failed to fetch user data:', error);
			}
		};

		console.log('fetch')
		fetchUserData();
	}, []);

	const prepareToChart = () => {
		const getChartData = {};
	
		Object.entries(testResults).forEach(([testType, results]) => {
			getChartData[testType] = results.map(({ score, created_at }) => {
				const formattedDate = new Date(created_at).toLocaleDateString('uk-UA');
				return {
					label: formattedDate,
					value: score,
					frontColor: '#4CAF50'
				};
			});
		});
		console.log('chart data', chartData)
		setChartData(getChartData)
	
		// return chartData;
	};
	useEffect(()=> {
		prepareToChart();

	}, [testResults])
	
    
    return (
        <View style={styles.container}>
			{/* <LockOrientation/> */}
            <Button title="Logout" onPress={handleLogout} />
            <FlatList
                data={tests}
                key={numColumns}
                numColumns={numColumns}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.testCircle} onPress={() => navigation.navigate(item)}>
                        <Text style={styles.testText}>{item}</Text>
                    </TouchableOpacity>
                )}
			/>
			<ScrollView>

				{userInfo && (
					<View style={styles.userInfo}>
						<Text style={styles.sectionTitle}>User Info</Text>
						<Text>Login: {userInfo.login}</Text>
					</View>
				)}

				{/* {userInfo && Object.entries(testResults).map(([testType, results]) => (
					<View key={testType} style={styles.testGroup}>
						<Text style={styles.testType}>{testType}</Text>
						{results.map(({score,created_at}, index) => {
							const formattedDate = new Date(created_at).toLocaleDateString('uk-UA');
							return (
								<Text key={index} style={styles.score}>
									Result {index + 1}: {score} — {formattedDate}
								</Text>
							);
						})}
					</View>
				))} */}

				<Chart testResults={chartData}/>
			</ScrollView>

			


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    testCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    testText: {
        fontSize: 18,
        padding: 10
    },
    screenText: {
        fontSize: 24
    }
});
  
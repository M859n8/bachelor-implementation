import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet,ScrollView, Dimensions, Alert, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Login';
import Chart from '../shared/Chart.js';
import CustomButton from '../shared/CustomButton.js';
import { SafeAreaView } from 'react-native-safe-area-context';

const tests = ["BellsCancellation","BlockDesign",
    "ComplexFigure","TransferringPennies", "VisualOrganization", "LineTracking"];

export default function Home({ setIsAuthenticated }) {

    const navigation = useNavigation();
	const [width, setWidth] = useState(0);

	// const { width } = useWindowDimensions();

    // const testCircleWidth = 120;
    // const numColumns = Math.max(1, Math.floor(width / testCircleWidth));
	const [radius, setRadius] = useState(0);

    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
		
        setRadius(width / 2);
    };

	// const [testCircleWidth, setTestCircleWidth] = useState(0);
	// const [numColumns, setNumColumns] = useState(0);

	// useEffect(() => {
	// 	const { width, height } = Dimensions.get('window');

	// 	console.log('width', width)
	// 	if (width > 0) {
	// 	const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;
	// 	setTestCircleWidth((width * 0.7) / numColumns);
	// 	setNumColumns(numColumns);
	// 	console.log('width', width, 'num colums', numColumns)

	// 	}
	// }, []);
	const [userInfo, setUserInfo] = useState(null);
	const [testResults, setTestResults] = useState([]);
	const [chartData, setChartData] = useState([])
	const [chartData2, setChartData2] = useState([])

	const [subdomainsResults, setSubdomainsResults] = useState([])

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
				// console.log('token', token)
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
					// console.log('data is', data)
					setUserInfo(data.user);
					setTestResults(data.groupedResults);
					setSubdomainsResults(data.subdomainsResults);
				}else{
					console.log('response is not ok')
				}
			} catch (error) {
				console.error('Failed to fetch user data:', error);
			}
		};

		// console.log('fetch')
		fetchUserData();
	}, []);

	const prepareToChart = (resultsByType, resultsByDomain) => {
		const testData = {};
		const subdomainData = Object.entries(resultsByDomain).map(([subdomain, result]) => ({
			label: subdomain,
			value: result
		}));
		testData['overall'] = subdomainData;
	
		Object.entries(resultsByType).forEach(([testType, results]) => {
			testData[testType] = results.map(({ score, created_at }) => {
				const formattedDate = new Date(created_at).toLocaleDateString('uk-UA');
				return {
					label: formattedDate,
					value: score,
					frontColor: '#4CAF50'
				};
			});
		});
		// console.log('chart data', testData)

		
		
		// setChartData(getChartData)

	
		return testData;
	};
	useEffect(()=> {
		const testData = prepareToChart(testResults, subdomainsResults)
		
		setChartData(testData)


	}, [testResults])
	
    
    return (
		<SafeAreaView style={styles.container} onLayout={(event) => {
			const { width } = event.nativeEvent.layout;
			setWidth(width);
		  }}>
		{/* <LockOrientation/> */}
		<CustomButton title="Logout" onPress={handleLogout} />
		{width > 0 && (
		<FlatList
			data={tests}
			numColumns={3}
			keyExtractor={(item) => item}
		
		// <View style={{justifyContent: 'center', alignItems: 'center' }}>
			contentContainerStyle={styles.testListContainer}
			ListHeaderComponent={
			<>
  
			  {userInfo && (
				<View style={styles.profileCard}>
				  <Text style={styles.profileTitle}>User Profile</Text>
				  <View style={styles.profileRow}>
					<Text style={styles.profileLabel}>Username:</Text>
					<Text style={styles.profileValue}>{userInfo.username}</Text>
				  </View>
				  <View style={styles.profileRow}>
					<Text style={styles.profileLabel}>Age:</Text>
					<Text style={styles.profileValue}>{userInfo.age}</Text>
				  </View>
				  <View style={styles.profileRow}>
					<Text style={styles.profileLabel}>Hand Orientation:</Text>
					<Text style={styles.profileValue}>{userInfo.handOrientation}</Text>
				  </View>
				</View>
			  )}
	  
			  <Text style={styles.profileTitle}>Available Tests</Text>
			</>
		  }
		  // </View>
  
		  
		  renderItem={({ item }) => (
			<TouchableOpacity
				onLayout={handleLayout}
				style={[
					styles.testCircle,
					{
					width: (width - 20 * (3 + 1)) / 3,
					aspectRatio: 1,
					borderRadius: radius,
					},
				]}
			  	onPress={() => navigation.navigate(item)}
			>
			  <Text style={styles.testText}>{item}</Text>
			</TouchableOpacity>
		  )}
		  ListFooterComponent={
			<View style={styles.resultsPart}>
			  <Text style={styles.profileTitle}>Results charts</Text>
			  <Chart testResults={chartData}/>
			</View>
  
		  }
		/>)}
	   </SafeAreaView>

    );
}

const styles = StyleSheet.create({
	container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        // paddingTop: 20,
		// justifyContent: 'center',
        // alignItems: 'center'
    },
    profileCard: {
        backgroundColor: '#f2f2f2',
		// width: '80%',
        borderRadius: 12,
        padding: '5%',
        marginBottom: '10%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    profileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
		// gap: '30%',
        marginBottom: 8,
    },
    profileLabel: {
        fontWeight: '600',
        color: '#555',
    },
    profileValue: {
        fontWeight: '400',
        color: '#000',
    },
    testHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    testListContainer: {
        alignItems: 'center',
        paddingBottom: 60,
		width: '100%'
    },
    testCircle: {
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
    },
    testText: {
        color: '#fff',
        fontWeight: 'bold',
    },
	resultsPart: {
		marginTop: '10%',

	}
});
  
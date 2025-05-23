/**
 * Author: Maryna Kucher
 * Description: Home screen of the application. Displays a list of available tests 
 * and visualizes the user's performance using charts.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Chart from '../shared/Chart.js';
import CustomButton from '../shared/CustomButton.js';
import { AuthContext } from '../shared/AuthContext.js';

const tests = ["BellsCancellation","BlockDesign",
    "ComplexFigure","TransferringPennies", "VisualOrganization", "LineTracking"];

export default function Home() {
	const { setIsAuthenticated } = useContext(AuthContext);

    const navigation = useNavigation();
	const [width, setWidth] = useState(0); //saves width for correct test list sizes

	const [radius, setRadius] = useState(0); //radius of the test elemnt button

	//сalled after layout to retrieve the button's width and calculate its radius
    const handleLayout = (event) => { 
        const { width } = event.nativeEvent.layout;
        setRadius(width / 2);
    };

	//states that will be filled with user data from database
	const [userInfo, setUserInfo] = useState(null);
	const [testResults, setTestResults] = useState([]);
	const [subdomainsResults, setSubdomainsResults] = useState([]);

	const [chartData, setChartData] = useState([]);//saves data prepared for the chart

    const handleLogout = async () => {
		try {
			await AsyncStorage.removeItem('authToken'); //delete token after logout
			setIsAuthenticated(false);  // update authorisation state
			
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Log out error',
				text2: 'Something went wrong while logging out.',
			});
		}
	};

	// const handleRegister= async () => {
	// 	console.log('got to handle register ')
	// 	try {
	// 		const response = await fetch('https://pc013089.fit.vutbr.cz/backend/api/auth/registration', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json'

	// 			},
	// 			body: JSON.stringify({
	// 				"username": "mk",
	// 				"email": "mk1@gmail.com",
	// 				"password1": "1111A@11",
	// 				"password2": "1111A@11"
	// 			}),
	// 		});

	// 		if(response.ok){
	// 			console.log('Successfully registered')
	// 		}else{
	// 			console.log('response not ok')
	// 		}
			
	// 	} catch (error) {
	// 		console.log('register error ')
	// 		Toast.show({
	// 			type: 'error',
	// 			text1: 'Register error',
	// 			text2: 'Something went wrong while register.',
	// 		});
	// 	}
	// };


	useEffect(() => {
		//get user results about previous assessments
		const fetchUserData = async () => { 
			try {
				const token = await AsyncStorage.getItem('authToken');
				const response = await fetch('http://localhost:5000/api/auth/user-info', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`

					},
					body: JSON.stringify([]),
				});
				const data = await response.json();
				if (response.ok) {
					//set user results and user info
					setUserInfo(data.user);
					setTestResults(data.groupedResults);
					setSubdomainsResults(data.subdomainsResults);
				}
			} catch (error) {
				Toast.show({
					type: 'error',
					text1:'Failed to fetch user data',
				});
			}
		};

		fetchUserData();
	}, []);

	//prepare backend data for charts
	const prepareToChart = (resultsByType, resultsByDomain) => {
		const testData = {};
		//results by subdomain
		//set subdomain as label and result as value
		const subdomainData = Object.entries(resultsByDomain).map(([subdomain, result]) => ({
			label: subdomain,
			value: result,
			frontColor: '#8D77AB'
		}));
		testData['overall'] = subdomainData;
	
		//results by skills type
		//set date as label and result as value
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
	
		return testData;
	};
	
	useEffect(()=> {
		const testData = prepareToChart(testResults, subdomainsResults)
		setChartData(testData)
	}, [testResults])
	
    
    return (
		<View style={styles.container} onLayout={(event) => {
			//measure width of the view for correct test list sizes
			const { width } = event.nativeEvent.layout; 
			setWidth(width);
		  }}>
		<CustomButton title="Logout" onPress={handleLogout} />
		{/* <CustomButton title="Register" onPress={handleRegister} /> */}

		{width > 0 && ( //show list if view width was measured
		<FlatList
			data={tests}
			numColumns={3}
			keyExtractor={(item) => item}
		
			contentContainerStyle={styles.testListContainer}
			ListHeaderComponent={ // user registration information
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
					<Text style={styles.profileLabel}>Email:</Text>
					<Text style={styles.profileValue}>{userInfo.email}</Text>
				  </View>
				</View>
			  )}
	  
			  <Text style={styles.profileTitle}>Available Tests</Text>
			</>
		  }
  
		  
		  renderItem={({ item }) => ( //each test item
			<TouchableOpacity
				onLayout={handleLayout}
				style={[
					styles.testCircle,
					{
					width: 200,
					aspectRatio: 1,
					borderRadius: radius,
					},
				]}
			  	onPress={() => navigation.navigate(item)}
			>
			  <Text style={styles.testText}>{item}</Text>
			</TouchableOpacity>
		  )}
		  ListFooterComponent={ //results charts
			<View style={styles.resultsPart}>
			  <Text style={styles.profileTitle}>Results charts</Text>
			  <Chart testResults={chartData}/>
			</View>
  
		  }
		/>)}
	   </View>

    );
}

const styles = StyleSheet.create({
	container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    profileCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: '5%',
        marginBottom: '10%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
		...(Platform.OS === 'web' && { //fixed width for web 
			padding: 40,
		  }),
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
		gap: '30%',
		...(Platform.OS === 'web' && { //fixed width for web 
			gap: 50,
		  }),
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
  
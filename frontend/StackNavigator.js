import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from "@react-navigation/stack"
import { useNavigation } from '@react-navigation/native';
import Home from "./screens/Home";
import Login from './screens/Login';
import ResultsScreen from './screens/ResultsScreen';


// import Second from "./screens/Second";

import Balance from "./screens/tests/Balance";
import BellsCancellation from "./screens/tests/BellsCancellation";
import BlockDesign from "./screens/tests/BlockDesign";
import ComplexFigure from "./screens/tests/ComplexFigure";
import LineTracking from "./screens/tests/LineTracking";
import TransferringPennies from "./screens/tests/TransferringPennies";
import VisualOrganization from "./screens/tests/VisualOrganization";

const Stack = createStackNavigator();

export default function StackNavigator() {

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigation = useNavigation();  

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        // navigation.replace("Login"); // Якщо токен невалідний — перенаправлення на логін

        return;
      }
  
      try {
        const response = await fetch('http://192.168.0.12:5000/api/auth/check', {
        // const response = await fetch('http://192.168.0.12:5000/api/auth/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          // navigation.replace("Home"); // Якщо токен валідний — відкриваємо головну сторінку
        setIsAuthenticated(true);

        } else {
			console.log('auth check failed')
          // navigation.replace("Login"); // Якщо токен невалідний — перенаправлення на логін
        setIsAuthenticated(false);

        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.log("catched error ");
        // navigation.replace("Login"); // Якщо токен невалідний — перенаправлення на логін

        setIsAuthenticated(false);
      }
    };
  
    checkAuth();
  }, []);

  return (
    <Stack.Navigator screenOptions={{headersShown: false, cardStyle: {
		flex: 1
	  }}}>
        {isAuthenticated ? (
        // {/* //  Захищені екрани (тільки для авторизованих) */}
        <Stack.Group> 
          {/* <Stack.Screen name="Home" component={Home} /> */}
          <Stack.Screen name="Home" >
            {props => <Home {...props} setIsAuthenticated={setIsAuthenticated} />} 
			</Stack.Screen>
			<Stack.Screen name="Balance" component={Balance} />
			<Stack.Screen name="BellsCancellation" component={BellsCancellation} />
			<Stack.Screen name="BlockDesign" component={BlockDesign} />
			<Stack.Screen name="ComplexFigure" component={ComplexFigure} />
			<Stack.Screen name="LineTracking" component={LineTracking} options={{animation: 'none'}}/>
			<Stack.Screen
				name="TransferringPennies"
				component={TransferringPennies}
				options={{
					gestureEnabled: false,
					animation: 'none', // <-- це вимикає slide-перехід
				}}
			/>

			<Stack.Screen name="VisualOrganization" component={VisualOrganization} />
			<Stack.Screen name="Results" component={ResultsScreen} />
        </Stack.Group>
        ) : ( 
        <Stack.Group>
          <Stack.Screen name="Login">
            {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen> 
          {/* <Stack.Screen name="Login" component={Login} /> */}

          {/* <Stack.Screen name="Register" component={Register} />  */}
        </Stack.Group>
      )} 

    </Stack.Navigator>
  );
};


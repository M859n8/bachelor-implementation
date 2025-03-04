import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from "@react-navigation/stack"
import Home from "./screens/Home";
import Login from './screens/Login';

// import Second from "./screens/Second";

import Balance from "./screens/tests/Balance";
import BellsCancelation from "./screens/tests/BellsCancelation";
import BlockDesign from "./screens/tests/BlockDesign";
import ComplexFigure from "./screens/tests/ComplexFigure";
import Drawing from "./screens/tests/Drawing";
import FacialRecognition from "./screens/tests/FacialRecognition";
import LineTracking from "./screens/tests/LineTracking";
import Steadiness from "./screens/tests/Steadiness";
import TransferringPennies from "./screens/tests/TransferringPennies";
import VisualOrganization from "./screens/tests/VisualOrganization";

const Stack = createStackNavigator();

export default function StackNavigator() {

  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
  
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
        // const response = await fetch('http://localhost:5000/api/auth/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem('authToken');
          console.log("else response not ok");
          
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.log("catched error ");

        setIsAuthenticated(false);
      }
    };
  
    checkAuth();
  }, []);

  return (
    <Stack.Navigator screenOptions={{headersShown: false}}>
        {isAuthenticated ? (
        //  Захищені екрани (тільки для авторизованих)
        <Stack.Group>
          {/* <Stack.Screen name="Home" component={Home} /> */}
          <Stack.Screen name="Home" >
            {props => <Home {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
          <Stack.Screen name="Balance" component={Balance} />
          <Stack.Screen name="BellsCancelation" component={BellsCancelation} />
          <Stack.Screen name="BlockDesign" component={BlockDesign} />
          <Stack.Screen name="ComplexFigure" component={ComplexFigure} />
          <Stack.Screen name="Drawing" component={Drawing} />
          <Stack.Screen name="FacialRecognition" component={FacialRecognition} />
          <Stack.Screen name="LineTracking" component={LineTracking} />
          <Stack.Screen name="Steadiness" component={Steadiness} />
          <Stack.Screen name="TransferringPennies" component={TransferringPennies} />
          <Stack.Screen name="VisualOrganization" component={VisualOrganization} />
        </Stack.Group>
      ) : (
        //  Публічні екрани (авторизація)
        <Stack.Group>
          <Stack.Screen name="Login">
            {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
          {/* <Stack.Screen name="Register" component={Register} /> */}
        </Stack.Group>
      )}

    </Stack.Navigator>
  );
};


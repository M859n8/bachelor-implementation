import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from "@react-navigation/stack"
import Home from "./screens/Home";
import Second from "./screens/Second";
import FacialRecognition from "./screens/FacialRecognition";
import ComplexFigure from "./screens/ComplexFigure";
import VisualOrganization from "./screens/VisualOrganization";
import Login from './screens/Login';


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
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
          <Stack.Screen name="SecondScreen" component={Second} />
          <Stack.Screen name="FacialRecognition" component={FacialRecognition} />
          <Stack.Screen name="ComplexFigure" component={ComplexFigure} />
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


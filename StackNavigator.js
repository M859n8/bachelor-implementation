import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack"
import Home from "./screens/Home";
import Second from "./screens/Second";


const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headersShown: false}}>
        <Stack.Group>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="SecondScreen" component={Second} />
        </Stack.Group>

    </Stack.Navigator>
  );
};


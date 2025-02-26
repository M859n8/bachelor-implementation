import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack"
import Home from "./screens/Home";
import Second from "./screens/Second";
import FacialRecognition from "./screens/FacialRecognition";
import ComplexFigure from "./screens/ComplexFigure";
import VisualOrganization from "./screens/VisualOrganization";



const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headersShown: false}}>
        <Stack.Group>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="SecondScreen" component={Second} />
            <Stack.Screen name="FacialRecognition" component={FacialRecognition} />
            <Stack.Screen name="ComplexFigure" component={ComplexFigure} />
            <Stack.Screen name="VisualOrganization" component={VisualOrganization} />
        </Stack.Group>

    </Stack.Navigator>
  );
};


import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from "@react-navigation/native"
import { StyleSheet, Text, View } from 'react-native';

import StackNavigator from "./StackNavigator";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <StackNavigator />
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}

export default App;

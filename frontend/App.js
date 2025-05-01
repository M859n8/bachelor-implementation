import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import { StyleSheet, Text, View } from 'react-native';

import StackNavigator from "./StackNavigator";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
    return (
		<SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer>
                <StackNavigator />
            </NavigationContainer>
		</SafeAreaView>
    );
}

export default App;

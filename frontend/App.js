/**
 * Author: Maryna Kucher
 * Description: frontend entry point; sets up navigation, context providers, 
 * and wraps the app structure.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
// import React from 'react';
// import { View, Text } from 'react-native';

// export default function App() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Hello, Exp Web!</Text>
//     </View>
//   );
// }

import React from 'react';
import { SafeAreaView, Linking, Platform } from 'react-native';
import { View, Text } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import Toast from 'react-native-toast-message';
import StackNavigator from "./StackNavigator";

import { AuthProvider, AuthContext } from './shared/AuthContext';


function MainApp() {
	//get authentication status from context
	const { isAuthenticated } = React.useContext(AuthContext);
	// prevent rendering until auth status is determined
	if (isAuthenticated === null) return null; 

	return (
		<SafeAreaView style={{ flex: 1 }}>
		 	<NavigationContainer>
		 		<StackNavigator isAuthenticated={isAuthenticated} />
		 		<Toast />  
		 	</NavigationContainer>
			{/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text>Hello, Expo Web!</Text>
			</View> */}
		</SafeAreaView>
		
	);
}

export default function App() {
	return (
		<AuthProvider> 
			<MainApp />
		</AuthProvider>
	);
}
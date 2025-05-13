/**
 * Author: Maryna Kucher
 * Description: Implements navigation depending on the user's authentication status.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
 */
import React from 'react';
import { createStackNavigator } from "@react-navigation/stack"
import { AuthContext } from './shared/AuthContext';

import Home from "./screens/Home";
import Login from './screens/Login';
import ResultsScreen from './screens/ResultsScreen';

import BellsCancellation from "./screens/tests/BellsCancellation";
import BlockDesign from "./screens/tests/BlockDesign";
import ComplexFigure from "./screens/tests/ComplexFigure";
import LineTracking from "./screens/tests/LineTracking";
import TransferringPennies from "./screens/tests/TransferringPennies";
import VisualOrganization from "./screens/tests/VisualOrganization";

const Stack = createStackNavigator();

export default function StackNavigator() {

	const { isAuthenticated } = React.useContext(AuthContext);


	return (
		<Stack.Navigator screenOptions={{headersShown: false, cardStyle: {flex: 1}}}>
			{isAuthenticated ? ( //for authenticated users all tests are available
				<Stack.Group> 
					<Stack.Screen name="Home" component={Home}/>
					<Stack.Screen name="BellsCancellation" component={BellsCancellation} />
					<Stack.Screen name="BlockDesign" component={BlockDesign} />
					<Stack.Screen name="ComplexFigure" component={ComplexFigure} />
					<Stack.Screen name="LineTracking" component={LineTracking} options={{animation: 'none'}}/>
					<Stack.Screen
						name="TransferringPennies"
						component={TransferringPennies}
						options={{
							gestureEnabled: false,
							animation: 'none', //turn off the slide effect so that doesn't interfere with testing prosess
						}}
					/>

					<Stack.Screen name="VisualOrganization" component={VisualOrganization} />
					<Stack.Screen name="Results" component={ResultsScreen} />
				</Stack.Group>
			) : ( //unauthenticated users only see the login screen
				<Stack.Group>
					<Stack.Screen name="Login" component={Login}/> 
				</Stack.Group>
			)} 

		</Stack.Navigator>
	);
};


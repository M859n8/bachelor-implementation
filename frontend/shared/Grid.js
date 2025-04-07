import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
  } from 'react-native-reanimated';
import { StyleSheet, Text, View, Modal, Button,  TouchableOpacity, Image, Alert } from 'react-native';


export default function Grid({ onBlockMove }){
	const rows = 3;
	const cols = 3;
	
	// Створення сітки 3x3
	return (
	  <View style={styles.grid}>
		{Array.from({ length: rows }).map((_, rowIndex) => (
		  <View key={rowIndex} style={styles.row}>
			{Array.from({ length: cols }).map((_, colIndex) => (
			  <View key={colIndex} style={styles.cell}>
				<Text>{`(${rowIndex},${colIndex})`}</Text>
			  </View>
			))}
		  </View>
		))}
	  </View>
	);
  };

  const styles = StyleSheet.create({
	grid: {
		// width: '45%',
		// height: 'auto',
    	// aspectRatio: 1, 
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
	  },
	  row: {
		flexDirection: 'row',
		// justifyContent: 'space-between',
		width: '100%',
	  },
	  cell: {
		width: '34%',
		height: 'auto',
    	aspectRatio: 1, 
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'black',
	  },
  });
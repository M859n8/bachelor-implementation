import { StyleSheet, View} from 'react-native';


//grid element from block design test
export default function Grid({cellSize, dimention}){
	//create grid of a given dimention
	const gridWidth= cellSize*dimention;

	return (
	  <View style={[styles.grid, {width: gridWidth, aspectRatio: 1}]}>
		{Array.from({ length: dimention }).map((_, rowIndex) => (
		  <View key={rowIndex} style={styles.row}>
			{Array.from({ length: dimention }).map((_, colIndex) => (
			  <View key={colIndex} style={[styles.cell, { width: cellSize, aspectRatio: 1,}]}/>
			
			))}
		  </View>
		))}
	  </View>
	);
  };

  const styles = StyleSheet.create({
	grid: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		
		borderWidth: 3,
		borderColor: '#4CAF50',
		shadowColor: '#4CAF50',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.5,
		shadowRadius: 6,
		elevation: 6, //for android
	
		padding: 12,
		margin: 10,
	},
	
	row: {
		flexDirection: 'row',
		width: '100%',
	},
	cell: {
		justifyContent: 'center',
		alignItems: 'center',
	
	},
  });
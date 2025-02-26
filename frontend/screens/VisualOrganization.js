import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


export default function VisualOrganization() {
  return (
      <View style={styles.container}>
            <Text style={styles.screenText}>VisualOrganization 1 Screen</Text>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  }
});
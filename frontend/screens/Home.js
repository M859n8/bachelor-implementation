import { StatusBar } from 'expo-status-bar';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Login';



const tests = [ "Balance","BellsCancelation","BlockDesign",
    "ComplexFigure", "Drawing", "FacialRecognition", "LineTracking",
    "Steadiness","TransferringPennies", "VisualOrganization"];

export default function Home({ setIsAuthenticated }) {

    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;

    const handleLogout = async () => {
        try {
          await AsyncStorage.removeItem('authToken'); // Видаляємо токен
          Alert.alert('Logged out', 'You have been logged out successfully.');
    
          setIsAuthenticated(false);  // Оновлюємо стан авторизації
        //   navigation.navigate('Login');
        } catch (error) {
          console.error('Logout error:', error);
          Alert.alert('Error', 'Something went wrong while logging out.');
        }
      };
    
    return (
        <View style={styles.container}>
            <Button title="Logout" onPress={handleLogout} />
            <FlatList
                data={tests}
                key={numColumns}
                numColumns={numColumns}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.testCircle} onPress={() => navigation.navigate(item)}>
                        <Text style={styles.testText}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    testCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    testText: {
        fontSize: 18,
        padding: 10
    },
    screenText: {
        fontSize: 24
    }
});
  
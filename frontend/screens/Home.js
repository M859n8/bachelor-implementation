import { StatusBar } from 'expo-status-bar';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native"

const tests = ["FacialRecognition", "ComplexFigure", "VisualOrganization"];

export default function Home() {

    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;
    
    return (
        <View style={styles.container}>
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
  
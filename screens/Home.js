import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from "@react-navigation/native"

export default function Home() {

    const navigation = useNavigation();
    return (
        <>
        <Text>This is hommmme </Text>
        <Button onPress={() => navigation.navigate("SecondScreen")} title="Go to second screen"/>
    </>
    );
}
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Login({ setIsAuthenticated }) {
  const navigation = useNavigation(); // Ініціалізація навігації

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      console.log("Received:", data);
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);  // зберігаємо токен
        Alert.alert('Success', 'Logged in successfully');
        console.log('Token:', data.token);
        setIsAuthenticated(true);
        // navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);  // зберігаємо токен

        Alert.alert('Success', 'Logged in successfully');
        console.log('Token:', data.token);
        setIsAuthenticated(true);
        // navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  return (
    <View>
    <TextInput
      placeholder="Username"
      value={username}
      onChangeText={setUsername}
    />
    <TextInput
      placeholder="Password"
      value={password}
      secureTextEntry
      onChangeText={setPassword}
    />
    <Button title="Register" onPress={handleRegister} />

    <Button title="Login" onPress={handleLogin} />
  </View>
);
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  }
});
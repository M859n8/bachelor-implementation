/**
 * Author: Maryna Kucher
 * Description: Timer component for time-limited tests.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import { useEffect, useRef, useState,  } from 'react';
import {  Text, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 


export default function Timer({ isRunning, startTime}) {
    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
				//calculate percise time from the start
				var delta = Date.now() - startTime; 
                setTime(() => (delta / 1000)); //convert to seconds

            }, 100);
        } else {

            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    return (
       <View style={styles.container}>
            <Icon name="timer" size={30} color="#4CAF50" style={styles.icon} />
            <Text style={styles.timerText}>{time.toFixed(1)} s</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    icon: {
        marginRight: 8,
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});
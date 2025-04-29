import { useEffect, useRef, useState,  } from 'react';
import {  Text, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
export default function Timer({ isRunning, startTime}) {
    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
			// console.log('is running true', isRunning)
            intervalRef.current = setInterval(() => {
                // setTime((prev) => +(prev + 0.1).toFixed(1));
				var delta = Date.now() - startTime;
                setTime(() => (delta / 1000));

            }, 100);
        } else {
			console.log('is running false')

            clearInterval(intervalRef.current);
            // if (onStop) onStop(time); // передає час назад у батьківський компонент
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
        marginRight: 8, // відступ між іконкою та текстом
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333', // темний колір для тексту
    },
});
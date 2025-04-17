import { useEffect, useRef, useState } from 'react';
import {  Text} from 'react-native';

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
		<>
        <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 10 }}>
            ⏱ {time.toFixed(1)} s
        </Text>
		</>
    );
}

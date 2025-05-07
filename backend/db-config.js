import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Тут connect не потрібен, бо з mysql2/promise створення з'єднання уже асинхронне
        console.log('Connected to MySQL');

        return connection; // Повертаємо з'єднання, щоб використовувати його в іншому коді
    } catch (err) {
        console.error('Error connecting to MySQL: ', err);
    }
}

// Імпортуй та викликай функцію в іншому місці:
const connection = await initDB();

export default connection;

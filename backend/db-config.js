/**
 * Author: Maryna Kucher
 * Description: Configures database connection.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
    try {
		//create connection from data from .env
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL');

        return connection; // return connection to use it lately
    } catch (err) {
        console.error('Error connecting to MySQL: ', err);
    }
}


const connection = await initDB();

export default connection;

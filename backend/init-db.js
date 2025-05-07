// import connection from './db-config.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const connectionConfig = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	multipleStatements: true
  };
  

// SQL для створення таблиці
const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  handOrientation ENUM( 'left', 'right') NOT NULL
);
`;
// SQL для вибору бази даних
const createTestTableQuery = `
CREATE TABLE IF NOT EXISTS test_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_type ENUM(
    'visualDescrimination', 
    'figureGround',
    'spatialRelations',
    'visualClosure',
    'movementSpeed',
	'movementAccuracy',
    'bilateralCoordination',
    'copyingObjects',
    'assemblingObjects'
  ) NOT NULL,
  score FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

// Функція для створення бази даних і таблиць
const createDatabaseAndTable = async () => {
  // Створення бази даних
  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
		// Створення бази даних, якщо вона не існує
		await connection.query(`CREATE DATABASE IF NOT EXISTS motor_cognitive_db`);
		console.log('Database motor_cognitive_db created or already exists');

		// Використання бази даних
		await connection.query(`USE motor_cognitive_db`);
		console.log('Using database motor_cognitive_db');
		// Створення таблиці users
		await connection.query(createUserTableQuery);
		console.log('User table created or already exists');

		// Створення таблиці tests
		await connection.query(createTestTableQuery);
		console.log('Test table created or already exists');

	} catch (err) {
		console.error('Error:', err);
	} finally {
		if (connection) {
			await connection.end(); // Закриваємо з'єднання
		  }
	}
};

// Виконання створення бази даних і таблиці
createDatabaseAndTable();
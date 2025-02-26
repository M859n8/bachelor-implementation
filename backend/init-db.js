const connection = require('./db-config');

// Створення бази даних і таблиці
const createDatabaseAndTables = `
CREATE DATABASE IF NOT EXISTS motor_cognitive_db;
USE motor_cognitive_db;

CREATE TABLE IF NOT EXISTS motor_cognitive_db.users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);


`;

connection.query(createDatabaseAndTables, (err, results) => {
    if (err) {
        console.error('Error creating database or tables:', err);
    } else {
        console.log('Database and tables created or verified');
    }
    connection.end();
});

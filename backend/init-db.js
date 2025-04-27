import connection from './db-config.js';


// SQL для створення таблиці
const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
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
    'visualConstancy',
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
const createDatabaseAndTable = () => {
  // Створення бази даних
  connection.query(createUserTableQuery, (err) => {
    if (err) {
      console.error('Error creating user table:', err);
      return;
    }


    connection.query(createTestTableQuery, (err) => {
      if (err) {
        console.error('Error creating test table:', err);
        return;
      }

	  console.log('Database created or already exists');


      connection.end();
    });
  });
};

// Виконання створення бази даних і таблиці
createDatabaseAndTable();
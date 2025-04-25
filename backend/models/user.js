// user.js
import bcrypt from 'bcryptjs';
import db from '../db-config.js';

const User = {
  createUser: (username, password, callback) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
      if(err){
        return callback(err, null);
      }
      callback(null, results.insertId);
    });
  },

  findByUsername: (username, callback) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], callback);
  },

  findById: (id, callback) => {
    db.query('SELECT id, username FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); // повертаємо перший (і єдиний) результат
    });
  },

  getUserTestResults: (userId, callback) => {
    db.query(
        'SELECT test_type, score, created_at FROM test_results WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) return callback(err);

			console.log('reults', results)
            // Групуємо результати по test_type
            const grouped = results.reduce((acc, { test_type, score, created_at }) => {
				console.log('created at', created_at);
				if (!acc[test_type]) acc[test_type] = [];
				acc[test_type].push({ score, created_at });
				return acc;
			}, {});
			console.log('grouped is', grouped);			
            callback(null, grouped);
			}
		);
	}

  
};

export default User;

// createUser: (username, password, callback) => {
//   const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//   db.query(query, [username, password], (err, results) => {
//     if (err) return callback(err, null);
//     callback(null, { id: results.insertId, username: username });
//   });
// }

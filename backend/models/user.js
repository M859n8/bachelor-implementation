// user.js
import bcrypt from 'bcryptjs';
import db from '../db-config.js';

const User = {
  createUser: (username, password, callback) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], callback);
  },

  findByUsername: (username, callback) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], callback);
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

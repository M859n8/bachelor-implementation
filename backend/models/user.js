// user.js
import bcrypt from 'bcryptjs';
import db from '../db-config.js';

const userModel = {
	//creates user after registrstion
	createUser: async (username, password, age, handOrientation) => {
		const hashedPassword = bcrypt.hashSync(password, 10);
		const [result] = await db.execute(
			'INSERT INTO users (username, password, age, handOrientation) VALUES (?, ?, ?, ?)',
			[username, hashedPassword, age, handOrientation]
		);
		return result.insertId;
	},
	//finds by username after login
	findByUsername: async (username) => {
		const [rows] = await db.execute(
			'SELECT * FROM users WHERE username = ?',
			[username]
		);
		return rows[0];
	},
	// finds by user id 
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, username, age, handOrientation FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },
	//returns all tests results for this user
	getUserTestResults: async (userId) => {
		const [results] = await db.execute(
			'SELECT test_type, score, created_at FROM test_results WHERE user_id = ?',
			[userId]
		);
		return results;
	
	},
	//saves test result to the database
	saveToDatabase: async (userId, testType, score)=>{
		await db.execute(
            `INSERT INTO test_results (user_id, test_type, score)
            VALUES (?, ?, ?)`,
            [userId, testType, score] 
        );

	}
};

export default userModel;



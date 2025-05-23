/**
 * Author: Maryna Kucher
 * Description: Handles all database queries.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import bcrypt from 'bcryptjs';
import db from '../db-config.js';

const userModel = {
	//creates user after registration
	createUser: async (username, email, age) => {
		const [result] = await db.execute(
			'INSERT INTO users (username, email, age) VALUES (?, ?, ?)',
			[username, email, age]
		);
		return result.insertId;
	},
	//finds user by email after login
	findByEmail: async (email) => {
		const [rows] = await db.execute(
			'SELECT * FROM users WHERE email = ?',
			[email]
		);
		return rows[0];
	},
	// finds user by id 
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT id, username, email, age FROM users WHERE id = ?',
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



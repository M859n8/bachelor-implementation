import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.js';
const authController = {
	//method to register the user 
	register: async (req, res) => {

		try {
			//get register data from request
			const { username, password, age, handOrientation } = req.body;
			//check in db if user with this username exists
			const existingUser = await userModel.findByUsername(username);
			if (existingUser) {
				return res.status(400).json({ message: 'Username already exists' });
			}
			//add user to the database
			const userId = await userModel.createUser(username, password, age, handOrientation);
			//create a jwt token
			const token = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

			return res.status(201).json({ token });
		} catch (err) {
			res.status(500).json({ message: 'Server error' });
		}
		
	},

	//method to login the user 
	login: async (req, res) => {
		try {
			//get login data
			const { username, password } = req.body;
			//find user by username in database
			const user = await userModel.findByUsername(username);
			if (!user) {
				return res.status(400).json({ message: 'Invalid credentials' });
			}
			//call main backend and get info 
			//check password
			const isMatch = bcrypt.compareSync(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ message: 'Invalid credentials' });
			}
			//create a token
			const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
			res.json({ token });
		} catch (err) {
			res.status(500).json({ message: 'Server error' });
		}
	},
};


export default authController; 

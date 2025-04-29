import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.js';
const authController = {
	register: async (req, res) => {
		console.log("Received body:", req.body);

		try {
			const { username, password, age, handOrientation } = req.body;
			const existingUser = await userModel.findByUsername(username);
			if (existingUser) {
				return res.status(400).json({ message: 'Username already exists' });
			}
			const userId = await userModel.createUser(username, password, age, handOrientation);
			const token = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

			return res.status(201).json({ token });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Server error' });
		}
		
	},

	login: async (req, res) => {
		console.log('got to login')
		try {
			const { username, password } = req.body;
			console.log('username and password', username, password)

			const user = await userModel.findByUsername(username);
			if (!user) {
				console.log('invalid user')
				return res.status(400).json({ message: 'Invalid credentials' });
			}
			const isMatch = bcrypt.compareSync(password, user.password);
			if (!isMatch) {
				console.log('invalid pass')

				return res.status(400).json({ message: 'Invalid credentials' });
			}
			console.log('valid user')
			
			const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
			res.json({ token });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Server error' });
		}
	},
};


export default authController; 

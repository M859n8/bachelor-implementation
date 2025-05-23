/**
 * Author: Maryna Kucher
 * Description: Controller for handling user registration and login.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.js';
const authController = {
	//method to register the user 
	register: async (req, res) => {

		try {
			//get register data from request
			const { username, password, age, handOrientation } = req.body;
			//check in database if user with this username exists
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

	loginAuthorized: async (req, res) => {
		console.log('got here ')
		try {
			//get register data from request
			const { username, email, age } = req.body;

			//check in database if user with this email exists
			const existingUser = await userModel.findByEmail(email);
			if (!existingUser) {
				existingUser = await userModel.createUser(username, email, age);
			}
			console.log('existing user ', existingUser)
			
			//create a jwt token
			const token = jwt.sign({ id: existingUser.id, username: existingUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
			console.log('token', token )
			// try {
			// 	const response = await fetch('https://pc013089.fit.vutbr.cz/backend/api/auth/registration/', {
			// 		method: 'POST',
			// 		headers: {
			// 			'Content-Type': 'application/json'
	
			// 		},
			// 		body: JSON.stringify({
			// 			"username": "maryna",
			// 			"email": "mk11@gmail.com",
			// 			"password1": "11@@22KM",
			// 			"password2": "11@@22KM"
			// 		}),
			// 	});
			// 	console.log('response ', response)
			// 	if(response.ok){
			// 		console.log('Successfully registered')
					
			// 	}else{
			// 		console.log('response not ok')
			// 		// const text = await response.text();
			// 		// console.log(text);

			// 	}
				
			// } catch (error) {
			// 	console.log('register error ')
			// }
			return res.status(201).json({ token });
		} catch (err) {
			res.status(500).json({ message: 'Server error' });
		}

	},
	
};


export default authController; 

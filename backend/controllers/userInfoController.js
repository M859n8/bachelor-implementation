import connection from './../db-config.js';

import User from '../models/user.js';
const userInfoController = {


	getUserInfo: (req, res) => {
		console.log('got to user info')
		const userId = req.user.id;

		User.findById(userId, (err, user) => {
			if (err || !user) {
				console.log('err1')
				return res.status(404).json({ error: 'User not found' });
			}

			User.getUserTestResults(userId, (err, groupedResults) => {
				if (err) return res.status(500).json({ error: 'DB error' });
				// res.json(groupedResults); // наприклад: { memory: [85, 90], attention: [75] }
			
		
		// res.json({ user: { login: "test" }, results: [] });

				res.json({
					user: {
					login: user.username
					},
					groupedResults
				});
			});
		});

	},

}
export default userInfoController;
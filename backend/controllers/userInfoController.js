import connection from './../db-config.js';

import userModel from '../models/user.js';
const userInfoController = {


	getUserInfo: async (req, res) => {
		console.log('got to user info')
		const userId = req.user.id;
		try {
			const results = await userModel.getUserTestResults(userId);
			const user = await userModel.findById(userId);

			
			// Групуємо результати по test_type
			const grouped = results.reduce((acc, { test_type, score, created_at }) => {
				if (!acc[test_type]) acc[test_type] = [];
				acc[test_type].push({ score, created_at });
				return acc;
			}, {});
			console.log(grouped)
	
			// Відправляємо згруповані результати в клієнт
			// res.json(grouped);
			res.json({
				user: {
				login: user.username
				},
				groupedResults: grouped || []
			});
		} catch (err) {
			console.error('Error retrieving test results: ', err);
			res.status(500).json({ error: 'Failed to retrieve test results' });
		}

	},

}
export default userInfoController;
import connection from './../db-config.js';
import userModel from '../models/user.js';

const subdomains = {
	motorFunctions: ["movementSpeed", "movementAccuracy", "bilateralCoordination"],
	visualPerception: ["visualDescrimination", "figureGround", "spatialRelations", "visualClosure"],
	visuoconstructionalReasoning: ["copyingObjects", "assemblingObjects"]
  };

  
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

			const subdomainsResults = userInfoController.scoreBySubdomains(grouped)
	
			// Відправляємо згруповані результати в клієнт
			// res.json(grouped);
			res.json({
				user: {
				username: user.username,
				age: user.age,
				handOrientation: user.handOrientation

				},
				groupedResults: grouped || [],
				subdomainsResults: subdomainsResults,
			});
		} catch (err) {
			console.error('Error retrieving test results: ', err);
			res.status(500).json({ error: 'Failed to retrieve test results' });
		}

	},

	scoreBySubdomains: (grouped)=> {
		const latestResults = {};
		for (const testType in grouped) {
			const sorted = grouped[testType].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			latestResults[testType] = sorted[0].score;  // беремо найсвіжіший результат
		}

		// 3. Тепер рахуємо субдомени:
		const finalScores = {};

		for (const [subdomainName, requiredTests] of Object.entries(subdomains)) {
		const availableScores = requiredTests.map(test => latestResults[test]).filter(score => score !== undefined);

		if (availableScores.length === requiredTests.length) {
			const sum = availableScores.reduce((acc, val) => acc + val, 0);
			finalScores[subdomainName] = (sum / availableScores.length).toFixed(2);
		} else {
			finalScores[subdomainName] = null; // якщо нема всіх тестів, результат буде null
		}
		}
		console.log('scores by subdomains', finalScores)
		return finalScores

	}

}
export default userInfoController;
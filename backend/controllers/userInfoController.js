import connection from './../db-config.js';
import userModel from '../models/user.js';

//features organized by subdomains
const subdomains = {
	motorFunctions: ["movementSpeed", "movementAccuracy", "bilateralCoordination"],
	visualPerception: ["visualDescrimination", "figureGround", "spatialRelations", "visualClosure"],
	visuoconstructionalReasoning: ["copyingObjects", "assemblingObjects"]
  };

  
const userInfoController = {
	//returns to the frontend all user information stored in the database
	getUserInfo: async (req, res) => {
		const userId = req.user.id;
		try {
			//get all results associated with this user
			const results = await userModel.getUserTestResults(userId);
			//get user info
			const user = await userModel.findById(userId);

			
			//Group the results by test_type
			const grouped = results.reduce((acc, { test_type, score, created_at }) => {
				if (!acc[test_type]) acc[test_type] = [];
				acc[test_type].push({ score, created_at });
				return acc;
			}, {});
			//calculate scores by subdomains
			const subdomainsResults = userInfoController.scoreBySubdomains(grouped)
	
			//send to the user
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

	//calculates scores by subdomains
	scoreBySubdomains: (grouped)=> {
		const latestResults = {};
		for (const testType in grouped) {
			const sorted = grouped[testType].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			latestResults[testType] = sorted[0].score;  //take the most recent result
		}

		const finalScores = {};
		//calculate the result for each subdomain based on the features that belong to it
		for (const [subdomainName, requiredTests] of Object.entries(subdomains)) {
			const availableScores = requiredTests.map(test => latestResults[test]).filter(score => score !== undefined);

			if (availableScores.length === requiredTests.length) {
				const sum = availableScores.reduce((acc, val) => acc + val, 0);
				finalScores[subdomainName] = (sum / availableScores.length).toFixed(2);
			} else {
				finalScores[subdomainName] = null; //if there are no results for all tests, it will be null
			}
		}
		return finalScores;

	}

}
export default userInfoController;
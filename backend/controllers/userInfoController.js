/**
 * Author: Maryna Kucher
 * Description: Controller that returns user information from the users and test results table.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import userModel from '../models/user.js';

//features organized by subdomains
const subdomains = {
	"Motor Functions": ["movementSpeed", "movementAccuracy", "bilateralCoordination"],
	"Visual Perception": ["visualDescrimination", "figureGround", "spatialRelations", "visualClosure"],
	"Visuoconstructional Reasoning": ["copyingObjects", "assemblingObjects"]
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

			
			//group the results by test_type
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
				//if there are no results for at least one test, the total result of the subdomain is null
				finalScores[subdomainName] = null; 
			}
		}
		return finalScores;

	}

}
export default userInfoController;
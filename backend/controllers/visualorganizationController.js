/**
 * Author: Maryna Kucher
 * Description: Controller responsible for processing and storing results 
 * of the Visual Organization Test.
 * 
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import stringSimilarity from "string-similarity";
import userModel from '../models/user.js';

//correct answers with synonyms for picture organization tasks
const correctAnswers = { 
	0: ["fish"],
	1: ["saw"],
	2: ["table", "desk"],
	3: ["airplane", "plane", "jet"],
	4: ["ball", "tennis ball", "cut ball"],
	5: ["axe", "hatchet", "cleaver"],
	6: ["dog", "puppy", "small dog", "hound"],
	7: ["car", "truck", "freight vehicle", "lorry", "van"],
	8: ["cup", "mug", "chalice"],
	9: ["hand", "palm", "fist"],
	10: ["apple", "tomato", "fruit"],
	11: ["rabbit", "hare", "bunny"],
	12: ["scissors", "shears", "clippers"],
	13: ["cane", "walking stick", "staff"],
	14: ["lighthouse", "beacon", "pharos"],
	15: ["kettle", "teapot", "boiler"],
	16: ["armchair", "chair", "couch", "sofa"],
	17: ["candle", "candlestick", "torch", "lantern"],
	18: ["teapot", "kettle"],
	19: ["cat", "kitten", "small cat"],
	20: ["flower", "blossom", "plant"],
	21: ["mouse", "rodent", "rat"],
	22: ["book", "textbook", "volume"],
	23: ["key"],
	24: ["ring", "diamond ring", "engagement ring"]
  };
  


const visualorganizationController ={

	// main method that calculates and stores the test result
	saveResponse: async (req, res) => {
		const {userAnswers} = req.body;
		const user_id = req.user.id;

		if (!user_id || !userAnswers) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		let totalSimilarity = 0;
		let textCount = 0;
		
		let correctChoiceCount = 0;
		let choiceCount = 0;

		// calculate the similarity for each answer
		userAnswers.forEach((answer, index ) => {
			//if it is a picture organization task
			if (answer.type === 'text') {
				//get possible ansvers for this question
				const possibleAnswers = correctAnswers[answer.index] || [];
				//calculate similarity for each possible answer
				const similarities = possibleAnswers.map((correct) =>
					stringSimilarity.compareTwoStrings(answer.userAnswer.toLowerCase(), correct)
				);
				//find max similarity
				const maxSimilarity = Math.max(...similarities);
				totalSimilarity += maxSimilarity;
				textCount++;
			} else if (answer.type === 'multichoice') {
				//if it is a spatial relation task

				if (answer.isCorrect) {
					correctChoiceCount++;
				}
				choiceCount++;
			}
		});
		//calculate two types of results
		const textScore = textCount > 0 ? (totalSimilarity / textCount) * 100 : 0;
		const choiceScore = choiceCount > 0 ? (correctChoiceCount / choiceCount) * 100 : 0;

		// get overall result
		const finalScore = (textScore + choiceScore)/2;

		try {
			//save to db
			await userModel.saveToDatabase(user_id, "visualClosure", textScore)
			await userModel.saveToDatabase(user_id, "spatialRelations", choiceScore)

			//return to user
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore.toFixed(2)}%`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
	},

   
};

export default visualorganizationController;
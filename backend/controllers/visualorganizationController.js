// import connection from "../config/db.js";
import connection from './../db-config.js';
import stringSimilarity from "string-similarity";
import userModel from '../models/user.js';

const userResponses = {}; // Тимчасове сховище відповідей користувачі
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
    // Збереження відповіді в локальний масив
    /*ЗМІНИТИ ЦЕ НА ОДИН ЗАПИТ З МАСИВОМ ВІДПОВІЕЙ, А НЕ ПОЧЕРГОВЕ ВІДСИЛАННЯ ВІДПОВІДЕЦ*/
	saveResponse: async (req, res) => {
		console.log('got here');
		const {userAnswers} = req.body;
		console.log(userAnswers)
		const user_id = req.user.id;
		if (!user_id || !userAnswers) {
		// console.log(`error in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);

			return res.status(400).json({ error: "Missing required fields" });
		}
		// console.log(`ok in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);
		let totalSimilarity = 0;
		let textCount = 0;
		
		let correctChoiceCount = 0;
		let choiceCount = 0;
		// let totalQuestions = userAnswers.length;

		// Обчислюємо схожість для кожної відповіді
		userAnswers.forEach((answer, index ) => {
			// const task = testSet[index]; 
			if (answer.type === 'text') {
				const possibleAnswers = correctAnswers[answer.index] || [];
				// console.log('answer.index:', answer.index);
				// console.log('keys in correctAnswers:', Object.keys(correctAnswers));
				// console.log('answer.index:',correctAnswers[answer.index]);


				// console.log('possible answers', possibleAnswers)
				// console.log('user ansver', answer.userAnswer)
				const similarities = possibleAnswers.map((correct) =>
					stringSimilarity.compareTwoStrings(answer.userAnswer.toLowerCase(), correct)
				);
				const maxSimilarity = Math.max(...similarities);
				console.log('max similarity', maxSimilarity);
				totalSimilarity += maxSimilarity;
				textCount++;
			} else if (answer.type === 'multichoice') {
				if (answer.isCorrect) {
					correctChoiceCount++;
				}
				choiceCount++;
			}
		});
		console.log(totalSimilarity);

		console.log('total similarity', totalSimilarity, 'text count', textCount)

		const textScore = textCount > 0 ? (totalSimilarity / textCount) * 100 : 0;
		const choiceScore = choiceCount > 0 ? (correctChoiceCount / choiceCount) * 100 : 0;
		console.log(`Text score: ${textScore.toFixed(2)}%`);
		console.log(`Choice score: ${choiceScore.toFixed(2)}%`);
		// Підраховуємо загальний % правильності
		const finalScore = (textScore + choiceScore)/2;

		try {
			// (Тут можна зберігати фінальний результат у базу)
			// console.log(`User ${user_id} final score: ${finalScore}%`);

			// await visualorganizationController.saveToDatabase(user_id, finalScore, res);
			await userModel.saveToDatabase(user_id, "visualClosure", textScore)
			await userModel.saveToDatabase(user_id, "spatialRelations", choiceScore)


			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore}%`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
		// res.json({ message: "Response saved locally" });
	},

    // saveToDatabase: async(user_id, finalScore, res)=>{

	// 	try {
	// 		connection.execute(`
	// 		  INSERT INTO test_results (user_id, test_type, score)
	// 		  VALUES (?, ?, ?)
	// 		`, [user_id, "visualClosure", finalScore]);
		
	// 		// console.log(`Saved ${test_type} result (${score}) for user ${user_id}`);
	// 	} catch (err) {
	// 		console.error("Error saving result:", err);
    // 		res.status(500).json({ error: 'Error saving result' });
	// 	}

	// },
};

export default visualorganizationController;
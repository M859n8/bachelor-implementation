// import connection from "../config/db.js";
import connection from './../db-config.js';
import stringSimilarity from "string-similarity";
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
		const {answersArr} = req.body;
		console.log(answersArr)
		const user_id = req.user.id;
		if (!user_id || !answersArr) {
		// console.log(`error in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);

			return res.status(400).json({ error: "Missing required fields" });
		}
		// console.log(`ok in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);

		let totalSimilarity = 0;
		let totalQuestions = answersArr.length;

		// Обчислюємо схожість для кожної відповіді
		answersArr.forEach((userAnswer, index ) => {
			const possibleAnswers = correctAnswers[index] || [];
			const similarities = possibleAnswers.map((answer) =>
				stringSimilarity.compareTwoStrings(userAnswer.toLowerCase(), answer.toLowerCase())
			);
			const maxSimilarity = Math.max(...similarities);
			console.log(maxSimilarity);
			totalSimilarity += maxSimilarity;
		});
		console.log(totalSimilarity);


		// Підраховуємо загальний % правильності
		const finalScore = ((totalSimilarity / totalQuestions) * 100).toFixed(2);

		try {
			// (Тут можна зберігати фінальний результат у базу)
			// console.log(`User ${user_id} final score: ${finalScore}%`);

			await visualorganizationController.saveToDatabase(user_id, finalScore, res);

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

    saveToDatabase: async(user_id, finalScore, res)=>{
		// const query = `
		// 	INSERT INTO testResults (user_id, test_type, score)
		// 	VALUES (?, ?)
		// `;

		// connection.execute(query, [user_id,"visualClosure", finalScore], (err, results) => {
		// 	if (err) {
		// 	console.error("Error saving result:", err);
		// 	} else {
		// 	console.log("Result saved successfully:", results.insertId);
		// 	}
		// });
		try {
			connection.execute(`
			  INSERT INTO test_results (user_id, test_type, score)
			  VALUES (?, ?, ?)
			`, [user_id, "visualClosure", finalScore]);
		
			// console.log(`Saved ${test_type} result (${score}) for user ${user_id}`);
		} catch (err) {
			console.error("Error saving result:", err);
    		res.status(500).json({ error: 'Error saving result' });
		}

	},
};

export default visualorganizationController;
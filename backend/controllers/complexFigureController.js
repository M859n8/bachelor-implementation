
import fs from 'fs';
import connection from './../db-config.js';
import userModel from '../models/user.js';

import {spawn} from 'child_process';

const complexFigureController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
		console.log('got here 12');
        // const {bellsObjects, additionalData }= req.body;
        const user_id = req.user.id;
        if (!user_id) {

            return res.status(400).json({ error: "Missing required fields" });
        }

        const { svg } = req.body;
		// console.log('request body', svg);
		fs.writeFileSync('./assets/originalDrawing.svg', svg, 'utf-8');
		// console.log('success');


		 // Викликаємо Python скрипт, передаючи шлях до SVG файлу
		const child = spawn('python3', ['../backend/MLmodels/complexFigure/main.py', './assets/originalDrawing.svg']);

		let output = '';
		 // Обробляємо вивід з Python скрипта
		child.stdout.on('data', (data) => {
		   console.log(`stdout: ${data.toString()}`);
		   output += data.toString();
		});
		
		 // Обробляємо помилки
		child.stderr.on('data', (data) => {
		   console.error(`stderr: ${data.toString()}`);
		});
	   
		 // Перевірка завершення процесу
		child.on('close', async (code) => {
			if (code === 0) {

				try {
					// (Тут можна зберігати фінальний результат у базу)
					// console.log(`User ${user_id} final score: ${finalScore}%`);
					let finalScore = parseFloat(output).toFixed(4);
					finalScore *= 100;


		
					// await complexFigureController.saveToDatabase(user_id, finalScore, res);
					await userModel.saveToDatabase(user_id, "copyingObjects", finalScore)
		
					res.json({
						message: "Final score calculated",
						
						finalScore: `${finalScore}%`,
					});
				} catch (error) {
					console.error(error);
					res.status(500).json({ error: "Database error" });
				}
			} else {
				// Якщо процес завершився з помилкою
				res.status(500).json({ error: 'Error processing SVG' });
			}
		});

		// res.json({ message: 'SVG saved successfully' });
    },

	// saveToDatabase: async(user_id, finalScore, res)=>{
	// 	console.log('got into save', finalScore)


	// 	try {
	// 		connection.execute(`
	// 		  INSERT INTO test_results (user_id, test_type, score)
	// 		  VALUES (?, ?, ?)
	// 		`, [user_id, "copyingObjects", finalScore]);
		
	// 		console.log(`Saved result (${finalScore}) for user ${user_id}`);
	// 	} catch (err) {
	// 		console.error("Error saving result:", err);
    // 		res.status(500).json({ error: 'Error saving result' });
	// 	}

	// },

}

export default complexFigureController;
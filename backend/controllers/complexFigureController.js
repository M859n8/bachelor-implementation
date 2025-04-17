
import fs from 'fs';

import {spawn} from 'child_process';
import path from 'path';

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
		child.on('close', (code) => {
		   if (code === 0) {
			 // Якщо Python скрипт успішно завершився, надсилаємо відповідь користувачу
			 res.json({ message: 'SVG saved and processed successfully', finalScore: `${output}` });
		   } else {
			 // Якщо процес завершився з помилкою
			 res.status(500).json({ error: 'Error processing SVG' });
		   }
		});

		// res.json({ message: 'SVG saved successfully' });



    },

    calculateResults: async () => {

    }

}

export default complexFigureController;
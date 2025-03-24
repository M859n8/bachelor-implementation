import {spawn} from 'child_process';


const transferringPenniesController ={
	
		// Збереження відповіді в локальний масив
	saveResponse: (req, res) => {
		console.log("got here");
		console.log("Request body: ", req.body);
		
		const  coinData  = req.body;
		const user_id = req.user.id;
		
		if (!user_id ) {
		console.log("Missing token");

		return res.status(400).json({ error: "Missing required fields" });
		}
		if (!coinData) {
		console.log("Missing coin data");

		return res.status(400).json({ error: "Missing required fields" });
		}


		// console.log("Data : ", coinData);
		console.log("Received Data: ", JSON.stringify(coinData, null, 2));

		// console.trace("Trace: Execution reached 'end'");
		// res.json({ message: "Response saved locally" });
		transferringPenniesController.callModel(coinData, res); 
		// return;
		// res.json({ message: "Response saved locally" });
	},

	normalizeData : (userRequest) => {

	},

	callModel : (coinData, res)=> {
		// const inputData = JSON.stringify(req.body); 
		// Викликаємо Python скрипт, передаючи шлях до SVG файлу
		const child = spawn('python3', ['../backend/MLmodels/transferringPennies/training.py', coinData]);

		// Обробляємо вивід з Python скрипта
		child.stdout.on('data', (data) => {
		console.log(`stdout: ${data.toString()}`);
		});
	
		// Обробляємо помилки
		child.stderr.on('data', (data) => {
		console.error(`stderr: ${data.toString()}`);
		});
	
		// Перевірка завершення процесу
		child.on('close', (code) => {
		if (code === 0) {
			console.log('good');

			// Якщо Python скрипт успішно завершився, надсилаємо відповідь користувачу
			res.json({ message: 'Results calculated' });
		} else {
			console.log('bad');

			// Якщо процес завершився з помилкою
			res.status(500).json({ error: 'Error calculating results' });
		}
		});
	},

		
	};

	export default transferringPenniesController;
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

		const features = transferringPenniesController.extractFeatures(coinData);

		// console.trace("Trace: Execution reached 'end'");
		// res.json({ message: "Response saved locally" });
		
		transferringPenniesController.callModel(features, res);  //викликатимемо модель для кожного раунду окремо
		
		// return;
		// res.json({ message: "Response saved locally" });
	},

	// Функція для обчислення відстані між точками
	distance : (point1, point2) => {
		return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	},

	//because i do not have big dataset, im gona calculate detailed data 
	extractFeatures : (data) => {
		// Масив для збереження результатів
		const results = [];

		// Обчислення для кожного елементу
		data.forEach(entry => {
			const handChange = entry.hand_change_points[0];
			// console.log('hand change obj', handChange);
			//processing only data where hand change point is detected
			if (!handChange) return; // Пропускаємо, якщо немає зміни руки

			const coordStart = entry.start_coordinates;
			const coordEnd = entry.end_coordinates;
			const handChangeCoord = handChange;
			const timeStart = entry.time_start;
			const timeEnd = entry.time_end;
			const timeHandChange = handChangeCoord.time;
			const errors = entry.errors;
			const wholeDistance = transferringPenniesController.distance(coordStart, coordEnd);
			// const timeErr = entry.errors.reduce((sum, err) => sum + err.time, 0);

			let paramsL, paramsR;

			
			if(entry.round == 1){
				// Обчислення Vl
				//pixel/sec
				console.log('got into round 1');
				paramsL = transferringPenniesController.calculateMLParams(coordStart, handChangeCoord, timeStart, timeHandChange, errors, wholeDistance);
				paramsR = transferringPenniesController.calculateMLParams(handChangeCoord,coordEnd, timeHandChange, timeEnd, errors, wholeDistance);

				
			}else{
				// transferringPenniesController.calculateMLParams(speedRight, partRight, errNumRight, errTimeRight);
				// transferringPenniesController.calculateMLParams(handChangeCoord,coordEnd, timeHandChange, timeEnd, errors, wholeDistance);
				paramsR = transferringPenniesController.calculateMLParams(coordStart, handChangeCoord, timeStart, timeHandChange, errors, wholeDistance);
				paramsL = transferringPenniesController.calculateMLParams(handChangeCoord,coordEnd, timeHandChange, timeEnd, errors, wholeDistance);

			

			}
			const {speed: speedLeft, part: partLeft, errNum: errNumLeft,errTime: errTimeLeft} = paramsL;
			const {speed: speedRight, part: partRight, errNum: errNumRight,errTime: errTimeRight} = paramsR;

			
			// Додаємо результат
			results.push({
				// id: entry.id,
				round: entry.round,
				speedLeft, speedRight,
				partLeft, partRight,
				errNumLeft, errNumRight,
				errTimeLeft, errTimeRight,			
			});
		
		});

		// Показуємо результати
		console.log(results);
		return results;

	},

	calculateMLParams : (coordStart, coordEnd, timeStart, timeEnd, errors, wholeDistance) => {

		const errInZone = errors.filter(err => 
			Math.abs(err.x) > Math.abs(coordStart.x) && Math.abs(err.x) < Math.abs(coordEnd.x));
        const errNum = errInZone.length;
        const errTime = errInZone.reduce((sum, err) => sum + err.time, 0);
		// console.log('err num', errNum);
		// console.log('err tiime', errTime);

		const timeDiff = timeEnd - timeStart - errTime;
        const speed = timeDiff > 0 ? transferringPenniesController.distance(coordStart, coordEnd) / timeDiff : 0;
       
		// speed =  transferringPenniesController.distance(startCoords, handChangeCoords) / (timeHandChange - timeStart - timeErr);
		// speed =  transferringPenniesController.distance(endCoords, handChangeCoords) / (timeEnd - timeHandChange - timeErr);
		
		const part = transferringPenniesController.distance(coordStart, coordEnd) /wholeDistance;
		
		// const partLeft = transferringPenniesController.distance(handChangeCoords, startCoords) / transferringPenniesController.distance(endCoords,startCoords);
		return { speed, part, errNum, errTime  };

	},

	callModel : (coinData, res)=> {
		// const inputData = JSON.stringify(req.body); 
		// Викликаємо Python скрипт, передаючи шлях до SVG файлу
		const coin_data = JSON.stringify(coinData);
		const child = spawn('python3', ['../backend/MLmodels/transferringPennies/training.py', coin_data]);

		child.stdout.on('data', (data) => {
			const clusters = JSON.parse(data.toString());
			console.log('Clustered Data:', clusters);
		});
		
		child.stderr.on('data', (error) => {
			console.error('Error:', error.toString());
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
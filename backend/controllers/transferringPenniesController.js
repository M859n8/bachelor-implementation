import {spawn} from 'child_process';


const transferringPenniesController ={
	
		// Збереження відповіді в локальний масив
	saveResponse: (req, res) => {
		console.log("got here");
		// console.log("Request body: ", req.body);
		const  coinData  = req.body;
		const user_id = req.user.id;
		if (!user_id || !coinData) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		// console.log("Data : ", coinData);
		console.log("Received Data: ", JSON.stringify(coinData, null, 2));
		const features = transferringPenniesController.extractFeatures(coinData);
		let {avgLeft, avgRight} = transferringPenniesController.assessCoordination(features);
		console.log(`left percentage is ${avgLeft}, and right is ${avgRight}`);
		// console.trace("Trace: Execution reached 'end'");
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
		// console.log(results);
		return results;
	},

	calculateMLParams : (coordStart, coordEnd, timeStart, timeEnd, errors, wholeDistance) => {

		const errInZone = errors.filter(err => 
			Math.abs(err.x) > Math.abs(coordStart.x) && Math.abs(err.x) < Math.abs(coordEnd.x));
        const errNum = errInZone.length;
        const errTime = errInZone.reduce((sum, err) => sum + err.time, 0);
		const timeDiff = timeEnd - timeStart - errTime;
        const speed = timeDiff > 0 ? transferringPenniesController.distance(coordStart, coordEnd) / timeDiff : 0;
		const part = transferringPenniesController.distance(coordStart, coordEnd) /wholeDistance;

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
			// Якщо Python скрипт успішно завершився, надсилаємо відповідь користувачу
			res.json({ message: 'Results calculated' });
		} else {
			// Якщо процес завершився з помилкою
			res.status(500).json({ error: 'Error calculating results' });
		}
		});
	},

	assessCoordination: (dataArr) => {
		let totals = { left: [0, 0], right: [0, 0] };
	
		dataArr.forEach(({ speedLeft, speedRight, partLeft, partRight}) => {
			[speedLeft, partLeft].forEach((leftVal, i) => {
				let rightVal = [speedRight, partRight][i];
				let {percentage1, percentage2} = transferringPenniesController.percentageRatio(leftVal, rightVal);
				totals.left[i] += percentage1;
				totals.right[i] += percentage2;
			});
		});
	
		let numEntries = dataArr.length;
		let avg = (arr) => arr.map((val) => val / numEntries);
	
		return { avgLeft: avg(totals.left), avgRight: avg(totals.right) };
	},
	
	percentageRatio: (value1, value2) => {
		let total = value1 + value2 || 1; // Уникнення ділення на 0
		return { percentage1: (value1 * 100) / total, percentage2: (value2 * 100) / total };
	},

		
	};

	export default transferringPenniesController;
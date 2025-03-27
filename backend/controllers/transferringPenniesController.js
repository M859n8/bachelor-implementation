import {spawn} from 'child_process';

const COINS_PER_ROUND = 3; //will be 10 in final variant
const REFERENCE_SPEED = 0.75;

const transferringPenniesController ={
	
		// Збереження відповіді в локальний масив
	saveResponse: (req, res) => {
		console.log("got here");
		// console.log("Request body: ", req.body);
		const {coinData, additionalData} = req.body;
		const user_id = req.user.id;
		if (!user_id || !coinData) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		// console.log("Data : ", coinData);
		console.log("Received Data: ", JSON.stringify(coinData, null, 2));
		const features = transferringPenniesController.extractFeatures(coinData);
		const {resultLeft, resultRight} = transferringPenniesController.assessCoordination(features);
		console.log(`left percentage is ${resultLeft}, and right is ${resultRight}`);
		const overallResult = transferringPenniesController.assessOverall(additionalData);
		// console.trace("Trace: Execution reached 'end'");
		// transferringPenniesController.callModel(features, res);  //викликатимемо модель для кожного раунду окремо
		// return;
		res.json({ 
			message: "Response saved locally",
			finalScore: `Left to right hand \n ${resultLeft}% : ${resultRight}% \n Overallresult \n ${overallResult}`, 
		});
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
			/*може якщо не було зміни руки, але була помилка, записати це як момент зміни руки
				потім в обрахувнках до якої області належиться помилка, робити варіант, що якщо помилка 
				мменше або дірівнює координатам зміни руки, то вона належить до тієї то області
				
				також час помилки варто записувати по іншому. варто окремо записувати чам падіння і час підняття
				потім коли ми переводитимемо в масив хенд чендж, варто знайти середнє арифметичне
				
				але, може треба це робити не тут а на фронтенді? на фронтенді ми відсіюємо хенд чендж, 
				щоб вони були приблизно в центрі і все таке */
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
		//speed, part, errors, errorsTime
		let totals = { left: [0, 0, 0, 0], right: [0, 0, 0, 0] };
		let errorsEntries = 0;
		// let numEntries = dataArr.length;
	
		dataArr.forEach(({ speedLeft, speedRight, partLeft, partRight, errNumLeft, errNumRight, errTimeLeft, errTimeRight }) => {
			if (errNumLeft > 0 || errNumRight > 0) {
				errorsEntries++;
			}
			[speedLeft, partLeft, errNumLeft, errTimeLeft].forEach((leftVal, i) => {
				let rightVal = [speedRight, partRight, errNumRight, errTimeRight][i];
				let {percentage1, percentage2} = transferringPenniesController.percentageRatio(leftVal, rightVal);
				totals.left[i] += percentage1;
				totals.right[i] += percentage2;
				// if(i === 3){
				// 	console.log(`errrors left ${errNumLeft} and right ${errNumRight}`);
				// }
				
			});
		});
	
		// Допоміжна функція для обчислення середнього, враховуючи кількість записів з помилками
		const safeDiv = (val, div) => div === 0 ? 0 : val / div;

		// Обчислення середніх значень для лівої і правої руки
		const avgLeft = totals.left.map((val, i) => safeDiv(val, i < 2 ? dataArr.length : errorsEntries));
		const avgRight = totals.right.map((val, i) => safeDiv(val, i < 2 ? dataArr.length : errorsEntries));

		// Оцінки для лівої і правої руки (швидкість + задіяність + помилки та час)
		const scoreLeft = avgLeft[0] + avgLeft[1] + avgRight[2] + avgRight[3];
		const scoreRight = avgRight[0] + avgRight[1] + avgLeft[2] + avgLeft[3];

		// Порівняння відсотків між лівою та правою рукою
		let { percentage1, percentage2 } = transferringPenniesController.percentageRatio(scoreLeft, scoreRight);

		return { resultLeft: percentage1.toFixed(2), resultRight: percentage2.toFixed(2) };
	},

	assessErrors: (dataArr) => {
		/*кількість монеток з помилками до загальної кількості монеток -  
		
		left to right
		coin1PercentL = (numLeft/numLeft+right)*100, coin1PercentRight = ...
		coinAllErrorL = coin1PercentL + 2 + 3 .../ numCoinsWithErr
		*/
	},
	assessOverall: (data) => {
		// let numberCoinsRound1 = 0;
		// let numberCoinsRound2 = 0;


		// data.forEach( (entry) => {	
		// 	(entry.round === 1) ? numberCoinsRound1++ : numberCoinsRound2++;
		// })
		// const resultRound1 = numberCoinsRound1 * 100 / COINS_PER_ROUND;
		// const resultRound2 = numberCoinsRound2 * 100 / COINS_PER_ROUND;
		// return (resultRound1+resultRound2)/ 2
		const round1Duration = data.timeStartRound1 - data.timeEndRound1;
		const round2Duration = data.timeStartRound2 - data.timeEndRound2;
		// round1Duration+round2Duration

		//for each round get time start and end, divide by COINS_PER_ROUND and compare this speed to reference

	},
	
	percentageRatio: (value1, value2) => {
		let total = value1 + value2; 
		if (total === 0) return { percentage1: 0, percentage2: 0 }; // Уникнення ділення на 0
		return { percentage1: (value1 * 100) / total, percentage2: (value2 * 100) / total };
	},

		
	};

	export default transferringPenniesController;
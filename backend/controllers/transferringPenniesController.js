// import {spawn} from 'child_process';
import userModel from '../models/user.js';


const COINS_PER_ROUND = 6; //will be 9 in final variant
const REFERENCE_SPEED = 4; //18*10/30 (замінила 15 секунд на 30 а монетки на 10) 
const REFERENCE_WIDTH = 18; //inches


const transferringPenniesController ={
	
		// Збереження відповіді в локальний масив
	saveResponse: async (req, res) => {
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
		// console.log(`left percentage is ${resultLeft}, and right is ${resultRight}`);
		const {round1, round2} = transferringPenniesController.assessOverall(additionalData);
		console.log('round 1 and 2', round1, round2)
		const finalScore = (round1+round2)/2;
		// console.trace("Trace: Execution reached 'end'");
		// transferringPenniesController.callModel(features, res);  //викликатимемо модель для кожного раунду окремо
		// return;
		try {
			console.log('final score', finalScore, 'resultLeft', resultLeft)
			await userModel.saveToDatabase(user_id, "movementSpeed", finalScore)
			await userModel.saveToDatabase(user_id, "bilateralCoordination", resultLeft)
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore}`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
		// res.json({ 
		// 	message: "Response saved locally",
		// 	finalScore: `Left to right hand \n ${resultLeft}% : ${resultRight}% \n Overallresult 
		// 	\n ${round1}% \n and round 2 ${round2}%`, 
		// });
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
			const handChange = entry.hand_change_points;
			// console.log('hand change obj', handChange, entry);
			//processing only data where hand change point is detected
			if (!handChange) return; // Пропускаємо, якщо немає зміни руки 
			// console.log('return check')
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
		console.log(results);
		return results;
	},

	calculateMLParams : (coordStart, coordEnd, timeStart, timeEnd, errors, wholeDistance) => {

		const errInZone = errors.filter(err => 
			Math.abs(err.x) > Math.abs(coordStart.x) && Math.abs(err.x) <= Math.abs(coordEnd.x));
        const errNum = errInZone.length;
        const errTime = errInZone.reduce((sum, err) => sum + err.time, 0);
		const timeDiff = timeEnd - timeStart - errTime;
        const speed = timeDiff > 0 ? transferringPenniesController.distance(coordStart, coordEnd) / timeDiff : 0;
		const part = transferringPenniesController.distance(coordStart, coordEnd) /wholeDistance;

		return { speed, part, errNum, errTime  }; 
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

		return { resultLeft: percentage1 , resultRight: percentage2  };
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
		const round1Duration = (data.timeEndRound1 - data.timeStartRound1)/1000;
		const round2Duration = (data.timeEndRound2 - data.timeStartRound2)/1000;

		console.log('round 1 duration', round1Duration, 'round 2 duration', round2Duration);

		//reference speed = pathWidth * coinsAmount / 15 sec
		const speedRound1 = COINS_PER_ROUND * data.width / round1Duration;
		const speedRound2 = COINS_PER_ROUND * data.width / round2Duration;
		console.log('data width ', data.width, 'in cm ', data.width*2.45)
		console.log('round 1 speed', speedRound1, 'round 2 speed', speedRound2);
		
		
		const resultRound1 = (speedRound1 * 100) / REFERENCE_SPEED
		const resultRound2 = (speedRound2 * 100) / REFERENCE_SPEED

		console.log('results round 1 ', resultRound1, 'results round 2 ', resultRound2)
		
		return ({round1: resultRound1 , round2 : resultRound2 })

		

		//for each round get time start and end, divide by COINS_PER_ROUND and compare this speed to reference

	},
	
	percentageRatio: (value1, value2) => {
		let total = value1 + value2; 
		if (total === 0) return { percentage1: 0, percentage2: 0 }; // Уникнення ділення на 0
		return { percentage1: (value1 * 100) / total, percentage2: (value2 * 100) / total };
	},

		
	};

	export default transferringPenniesController;
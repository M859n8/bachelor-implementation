import userModel from '../models/user.js';


const bellsCancellationController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {bellsObjects, additionalData, otherObjects }= req.body;
        const user_id = req.user.id;
        if (!user_id || !bellsObjects || !additionalData || !otherObjects) {

            return res.status(400).json({ error: "Missing required fields" });
        }

		const user = await userModel.findById(user_id);
        // console.log("clicked obj", bellsObjects);
        // console.log("additional data", additionalData);
        // console.log("other objects", otherObjects);
		// console.log("test time duration", (additionalData.endTime-additionalData.startTime)/1000)

		const result = bellsCancellationController.calculateResults(bellsObjects, additionalData, otherObjects, user.age);


		try {
			await userModel.saveToDatabase(user_id, "figureGround", result.finalScore)
			await userModel.saveToDatabase(user_id, "visualDescrimination", result.visualDiscriminationScore)


			res.json({
				message: "Final score calculated",
				// finalScore: `${finalScore}`,
				finalScore: `Overall result ${result.finalScore}\n Symmetry score ${result.symmetryScore} \n Asymmetry ditrection ${result.asymmetryDirection}`, 

			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
		// console.log(result)
        // res.json({ 
		// 	message: "Response saved locally",
		// 	finalScore: `Overall result ${result.finalScore}\n Asymmetry score ${result.asymmetryScore} \n Asymmetry ditrection ${result.asymmetryDirection}`, 
		// });

    },

	getZone: (x, y, fieldWidth) =>{
		const midWidth = fieldWidth * 0.5;
	
		if (x < 0 ) {
			return null; // поза межами поля
		}
	
		if (x < midWidth ) return 1;
		if (x >= midWidth ) return 2;
	},

	getTimeByAge: (age) => {
		const timeByAge = [
			{ age: 20, refTime: 105 },
			{ age: 25, refTime: 108 },
			{ age: 30, refTime: 111 },
			{ age: 35, refTime: 114 },
			{ age: 40, refTime: 116 },
			{ age: 45, refTime: 119 },
			{ age: 50, refTime: 122 },
			{ age: 55, refTime: 125 },
			{ age: 60, refTime: 128 },
			{ age: 65, refTime: 130 },
			{ age: 70, refTime: 133 },
			{ age: 75, refTime: 136 },
			{ age: 80, refTime: 139 }
		]
		// Знаходимо найбільший запис, вік якого не перевищує age
		const closest = [...timeByAge]
			.reverse()
			.find(entry => age >= entry.age);

		return closest ? closest.refTime : 105;

	},

	

	analyzeZones: ({totalObjects, totalTargets, missedTargets, totalTimeSeconds, zoneStats, age}) =>{
		const REF_TIME = bellsCancellationController.getTimeByAge(age); // in future get time by age
		const REF_TARGETS_COUNT = 35;
		const REF_OBJECTS_COUNT = 315
		const REF_ERRORS_COUNT = 3;


		// --- Accuracy Score ---
		const pathologyThreshold = Math.ceil((REF_ERRORS_COUNT / REF_TARGETS_COUNT) * totalTargets);
		const accuracyScore = Math.max(0, (1 - (missedTargets / pathologyThreshold)) * 100);
		console.log('mіssed targets', missedTargets, 'accuracy score', accuracyScore, 'pathology ', pathologyThreshold)

		// --- Symmetry Score ---
		const {missedBells: leftMissed, clickedBells: leftClicked } = zoneStats[1];
		const {missedBells: rightMissed, clickedBells: rightClicked } = zoneStats[2];

		const leftTotal = leftMissed + leftClicked;
		const rightTotal = rightMissed + rightClicked;

		const leftRatio = leftTotal > 0 ? leftMissed / leftTotal : 0;
		const rightRatio = rightTotal > 0 ? rightMissed / rightTotal : 0;
		console.log("left ratio", leftRatio, 'right ratio', rightRatio)

		const pathologyAsymThreshold = REF_ERRORS_COUNT / (REF_TARGETS_COUNT /2);
		const asymmetryDiff = leftRatio - rightRatio; //біьше нуля -- більше помилок зліва-- неглект зліва 
		const symmetryScore = Math.max(0, (1 - (Math.abs(asymmetryDiff) / pathologyAsymThreshold)) * 100);

		// console.log('asymmetry diff', asymmetryDiff, 'symetry score', symmetryScore, 'pathology', pathologyAsymThreshold) 
		// console.log('left missed', leftMissed, 'left clicked',leftClicked, 'left ratio', leftRatio)
		// console.log('right missed', rightMissed, 'right clicked',rightClicked, 'right ratio', rightRatio)
		let direction = "balanced";
		if (asymmetryDiff > 0.1) direction = "left-side neglect";
		else if (asymmetryDiff < -0.1) direction = "right-side neglect";

		// --- Speed Score ---
		// const totalObjects = totalTargets; // або totalTargets + distractors якщо хочеш
		const actualTimePerObject = totalTimeSeconds / totalObjects;
		const standardTimePerObject = REF_TIME / REF_OBJECTS_COUNT;
		console.log('standart time per object', standardTimePerObject, 'actual', actualTimePerObject)
		const speedScore = Math.min(100, Math.max(0, (standardTimePerObject / actualTimePerObject ) * 100));
	
		console.log('speed score', speedScore)
		// --- Final Weighted Score ---
		const finalScore = (
			0.75 * accuracyScore +
			0.25 * speedScore
		);
	
		return {
			// accuracyScore: accuracyScore , //db
			symmetryScore: symmetryScore , //to user //db
			asymmetryDirection: direction, //to user // db
			// speedScore: speedScore , //db
			finalScore: finalScore  //to user
		};

	},

    calculateResults: (bellsObjects, additionalData, otherObjects, age) => {
		//можна розділити екран на кілька зон, визначити в яких зонах знаходяться елементи 
		// і визначити відсоток неглекту. це може бути осноаним показгиком тесту 
		/*  помилково натиснуті елементи покажуть здатністть розрізняти об'єкти за формами 
			і відрізняти об'єкт від фону 
			
			також впоиває порядоу натиснення елементів. можна переглянути чи змішуються зони . 
			типу чи не скаче взаємодія з елементами з однієї зони в іншу і тд.
			але не дуже зрозуміло як це оцінювати .немає визначеного правила з якої зони людина помивнна починати і тд 
			
			 
100
−
пропущені дзвіночки
+
кліки на зайві об’єкти
загальна кількість дзвіночків
×
100
100− 
загальна кількість дзвіночків
пропущені дзвіночки+кліки на зайві об’єкти
​
 ×10*/
		const zoneStats = {
			1: { clickedBells: 0, missedBells: 0, wrongClicks: 0 },
			2: { clickedBells: 0, missedBells: 0, wrongClicks: 0 }
		};
		const duration = (additionalData.endTime - additionalData.startTime)/1000;

		let weightedErrors = 0; //to assess visualDescrimination by shape
		const REF_ERRORS_COUNT = 3;
		let maxWeightedErrors = REF_ERRORS_COUNT * 3; //калькість помилок яка свідчить про патологію, множитимо на максимаоьну вагц


		let missedTargets = 0;
		bellsObjects.forEach(obj => {
			const zone = bellsCancellationController.getZone(obj.x , obj.y, additionalData.fieldWidth);
			if(!zone) return

			if(obj.touched){
				zoneStats[zone].clickedBells +=1;
				
			}else{
				zoneStats[zone].missedBells +=1;
				missedTargets +=1;

			}

		});

		otherObjects.forEach(obj => {
			const zone = bellsCancellationController.getZone(obj.x , obj.y, additionalData.fieldWidth);
			if(!zone) return
			zoneStats[zone].wrongClicks +=1;
			//visual descrimination assessment
			if ([ 6, 8, 10, 11].includes(obj.type)) { //similar forms
				weightedErrors += 1;
			} else if ([4, 7, 9, 12].includes(obj.type)) { //average
				weightedErrors += 2;
			} else if ([1, 2, 3, 5, 13].includes(obj.type)) { //completely different
				weightedErrors += 3;
			}

		});

		let visualDiscriminationScore = (1 - (weightedErrors / maxWeightedErrors)) * 100;
		visualDiscriminationScore = Math.max(0, visualDiscriminationScore );
		
		const overallResult = bellsCancellationController.analyzeZones({
				totalObjects: additionalData.allObjectsCount,
				totalTargets: bellsObjects.length,
				missedTargets,
				totalTimeSeconds: duration,
				zoneStats,
				age
		})
		// console.log('strategy analize', result)
		// console.log('overall result', overallResult)

		return {
			symmetryScore: overallResult.symmetryScore,
			asymmetryDirection: overallResult.asymmetryDirection,
			finalScore: overallResult.finalScore,
			visualDiscriminationScore,
		};

    }
}

export default bellsCancellationController;
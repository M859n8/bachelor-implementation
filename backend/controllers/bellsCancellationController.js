
// const userResponses = {}; // Тимчасове сховище відповідей користувачі


const bellsCancellationController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {bellsObjects, additionalData, otherObjects }= req.body;
        const user_id = req.user.id;
        if (!user_id || !bellsObjects || !additionalData || !otherObjects) {

            return res.status(400).json({ error: "Missing required fields" });
        }


        console.log("clicked obj", bellsObjects);
        console.log("additional data", additionalData);
        console.log("other objects", otherObjects);

		const result = bellsCancellationController.calculateResults(bellsObjects, additionalData, otherObjects);
		console.log(result)
        res.json({ 
			message: "Response saved locally",
			finalScore: `Overall result ${result.finalScore}\n 
						Asymmetry score ${result.asymmetryScore} \n 
						Asymmetry ditrection ${result.asymmetryDirection}`, 
		});

    },

	getZone: (x, y, fieldWidth, fieldHeight) =>{
		const midWidth = fieldWidth * 0.5;
	
		if (x < 0 ) {
			return null; // поза межами поля
		}
	
		if (x < midWidth ) return 1;
		if (x >= midWidth ) return 2;
	},

	//треба придумати що робити зі шляхом, бо поки не ясно взагалі
	analyzeStrategy: (zoneOrder, zoneStats) => {
		const result = {
			ignoredZones: [],
			dominantDirection: null,
			isChaotic: false,
			transitionCount: 0,
		};
	
		// --- 1. Ігноровані зони ---
		for (const zone in zoneStats) {
			const { clickedBells, missedBells } = zoneStats[zone];
			const total = clickedBells + missedBells;
			if (total !== 0 && clickedBells === 0) {
				result.ignoredZones.push(parseInt(zone));
			}
		}
	
		// --- 2. Кількість переходів ---
		let transitions = 0;
		for (let i = 1; i < zoneOrder.length; i++) {
			if (zoneOrder[i] !== zoneOrder[i - 1]) transitions++;
		}
		result.transitionCount = transitions;
	
		// --- 3. Хаотичність (умовно: багато змін між зонами при малій кількості дзвіночків) ---
		const zoneSwitchRatio = transitions / zoneOrder.length;
		result.isChaotic = zoneSwitchRatio > 0.6;
	
		// --- 4. Напрямок (приблизно) ---
		// Можна спробувати визначити переважаючі переходи
		const directions = {
			"1→2": 0, "2→3": 0, "3→4": 0,
			"4→3": 0, "3→2": 0, "2→1": 0
		};
		for (let i = 1; i < zoneOrder.length; i++) {
			const from = zoneOrder[i - 1];
			const to = zoneOrder[i];
			const key = `${from}→${to}`;
			if (directions.hasOwnProperty(key)) {
				directions[key]++;
			}
		}
	
		const forward = directions["1→2"] + directions["2→3"] + directions["3→4"];
		const backward = directions["4→3"] + directions["3→2"] + directions["2→1"];
	
		if (forward > backward * 1.5) result.dominantDirection = "зліва направо";
		else if (backward > forward * 1.5) result.dominantDirection = "справа наліво";
		else result.dominantDirection = "нечіткий/хаотичний";
	
		return result;
	},

	analyzeZones: ({totalObjects, totalTargets, missedTargets, totalTimeSeconds, zoneStats}) =>{
		const REF_TIME = 105; // in future get time by age
		const REF_TARGETS_COUNT = 35;
		const REF_OBJECTS_COUNT = 315
		const REF_ERRORS_COUNT = 3;


		// --- Accuracy Score ---
		const pathologyThreshold = (REF_ERRORS_COUNT / REF_TARGETS_COUNT) * totalTargets;
		const accuracyScore = Math.max(0, (1 - (missedTargets / pathologyThreshold)) * 100);
	
		// --- Asymmetry Score ---
		const {missedBells: leftMissed, clickedBells: leftClicked } = zoneStats[1];
		const {missedBells: rightMissed, clickedBells: rightClicked } = zoneStats[2];

		const leftTotal = leftMissed + leftClicked;
		const rightTotal = rightMissed + rightClicked;

		const leftRatio = leftTotal > 0 ? leftMissed / leftTotal : 0;
		const rightRatio = rightTotal > 0 ? rightMissed / rightTotal : 0;

		const asymmetryDiff = leftRatio - rightRatio; //біьше нуля -- більше помилок зліва-- неглект зліва 
		const asymmetryScore = Math.max(0, (1 - (Math.abs(asymmetryDiff) / 3)) * 100);

		let direction = "balanced";
		console.log('asymmetry diff', asymmetryDiff, 'left', leftMissed, 'right',leftClicked)
		if (asymmetryDiff > 0.1) direction = "left-side neglect";
		else if (asymmetryDiff < -0.1) direction = "right-side neglect";

		// --- Speed Score ---
		// const totalObjects = totalTargets; // або totalTargets + distractors якщо хочеш
		const actualTimePerObject = totalTimeSeconds / totalObjects;
		const standardTimePerObject = REF_TIME / REF_OBJECTS_COUNT;
		const speedScore = Math.min(100, Math.max(0, (standardTimePerObject / actualTimePerObject) * 100));
	
		// --- Final Weighted Score ---
		const finalScore = (
			0.75 * accuracyScore +
			0.25 * speedScore
		);
	
		return {
			accuracyScore: accuracyScore.toFixed(2), //db
			asymmetryScore: asymmetryScore.toFixed(2), //to user //db
			asymmetryDirection: direction, //to user // db
			speedScore: speedScore.toFixed(2), //db
			finalScore: finalScore.toFixed(2) //to user
		};

	},

    calculateResults: (bellsObjects, additionalData, otherObjects) => {
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
		const clickedSequence = [];
		const fieldWidth = additionalData.screenWidth * 0.9;
		const fieldHeight = additionalData.screenHeight * 0.75;
		const duration = (additionalData.endTime - additionalData.startTime)/1000;

		let missedTargets = 0;
		bellsObjects.forEach(obj => {
			const zone = bellsCancellationController.getZone(obj.x , obj.y, fieldWidth, fieldHeight);
			if(!zone) return

			if(obj.touched){
				zoneStats[zone].clickedBells +=1;
				clickedSequence.push({
					zone,
					time: obj.time
				});
			}else{
				zoneStats[zone].missedBells +=1;
				missedTargets +=1;

			}

		});

		otherObjects.forEach(obj => {
			const zone = bellsCancellationController.getZone(obj.x , obj.y, fieldWidth, fieldHeight);
			if(!zone) return

			zoneStats[zone].wrongClicks +=1;
		});
		
		clickedSequence.sort((a, b) => a.time - b.time);
		const zoneOrder = clickedSequence.map(item => item.zone);
		const result = bellsCancellationController.analyzeStrategy(zoneOrder, zoneStats);
		const overallResult = bellsCancellationController.analyzeZones({
				totalObjects: additionalData.allObjectsCount,
				totalTargets: bellsObjects.length,
				missedTargets,
				totalTimeSeconds: duration,
				zoneStats
		})
		// console.log('strategy analize', result)
		// console.log('overall result', overallResult)

		return {
			asymmetryScore: overallResult.asymmetryScore,
			asymmetryDirection: overallResult.asymmetryDirection,
			finalScore: overallResult.finalScore
		};

    }
}

export default bellsCancellationController;
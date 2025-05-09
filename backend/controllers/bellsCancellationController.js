import userModel from '../models/user.js';


const bellsCancellationController = {

    saveResponse: async (req, res) => {
        const {bellsObjects, additionalData, otherObjects }= req.body;
        const user_id = req.user.id;

        if (!user_id || !bellsObjects || !additionalData || !otherObjects) {
            return res.status(400).json({ error: "Missing required fields" });
        }
		//get user age from db
		const user = await userModel.findById(user_id);
		//calculate results
		const result = bellsCancellationController.calculateResults(bellsObjects, additionalData, otherObjects, user.age);


		try {
			//save to db
			await userModel.saveToDatabase(user_id, "figureGround", result.finalScore)
			await userModel.saveToDatabase(user_id, "visualDescrimination", result.visualDiscriminationScore)

			//send to user 
			res.json({
				message: "Final score calculated",
				finalScore: `Overall result ${result.finalScore.toFixed(2)}%\nSymmetry score ${result.symmetryScore.toFixed(2)}%\nAsymmetry ditrection ${result.asymmetryDirection}`, 

			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
		

    },

	//get object zone (left or right)
	getZone: (x, y, fieldWidth) =>{
		const midWidth = fieldWidth * 0.5;
	
		if (x < 0 ) {
			return null; //out of field
		}
	
		if (x < midWidth ) return 1;
		if (x >= midWidth ) return 2;
	},

	//reference time by age
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
		//find the largest record whose age does not exceed age
		const closest = [...timeByAge]
			.reverse()
			.find(entry => age >= entry.age);

		//for age under 20 years 
		return closest ? closest.refTime : 105;

	},

	
	//evaluates by zones
	analyzeZones: ({totalObjects, totalTargets, missedTargets, totalTimeSeconds, zoneStats, age}) =>{
		const REF_TIME = bellsCancellationController.getTimeByAge(age); //get reference time
		const REF_TARGETS_COUNT = 35;
		const REF_OBJECTS_COUNT = 315
		const REF_ERRORS_COUNT = 3;


		// --- Accuracy Score ---
		const pathologyThreshold = Math.ceil((REF_ERRORS_COUNT / REF_TARGETS_COUNT) * totalTargets);
		//compare with pathology threshold
		const accuracyScore = Math.max(0, (1 - (missedTargets / pathologyThreshold)) * 100);

		// --- Symmetry Score ---
		const {missedBells: leftMissed, clickedBells: leftClicked } = zoneStats[1];
		const {missedBells: rightMissed, clickedBells: rightClicked } = zoneStats[2];

		const leftTotal = leftMissed + leftClicked;
		const rightTotal = rightMissed + rightClicked;

		const leftRatio = leftTotal > 0 ? leftMissed / leftTotal : 0;
		const rightRatio = rightTotal > 0 ? rightMissed / rightTotal : 0;

		const pathologyAsymThreshold = REF_ERRORS_COUNT / (REF_TARGETS_COUNT /2);
		const asymmetryDiff = leftRatio - rightRatio; //to calculate asymetry direction
		//compare with pathology threshold
		const symmetryScore = Math.max(0, (1 - (Math.abs(asymmetryDiff) / pathologyAsymThreshold)) * 100);

		//get asymetry direction
		let direction = "balanced";
		if (asymmetryDiff > 0.1) direction = "left-side neglect";
		else if (asymmetryDiff < -0.1) direction = "right-side neglect";

		// --- Speed Score ---
		const actualTimePerObject = totalTimeSeconds / totalObjects;
		const standardTimePerObject = REF_TIME / REF_OBJECTS_COUNT;
		//compare with pathology threshold
		const speedScore = Math.min(100, Math.max(0, (standardTimePerObject / actualTimePerObject ) * 100));
	
		// --- Final Weighted Score ---
		const finalScore = (
			0.75 * accuracyScore +
			0.25 * speedScore
		);
	
		return {
			symmetryScore: symmetryScore , //to user //db
			asymmetryDirection: direction, //to user // db
			finalScore: finalScore  //to user
		};

	},

	//collects data by zones, calls evaluation function. Assesses differenciation by forms
    calculateResults: (bellsObjects, additionalData, otherObjects, age) => {
		
		const zoneStats = {
			1: { clickedBells: 0, missedBells: 0, wrongClicks: 0 },
			2: { clickedBells: 0, missedBells: 0, wrongClicks: 0 }
		};
		const duration = (additionalData.endTime - additionalData.startTime)/1000;

		let weightedErrors = 0; //to assess visualDescrimination by shape
		const REF_ERRORS_COUNT = 3;//pathology threshold
		let maxWeightedErrors = REF_ERRORS_COUNT * 3; 


		let missedTargets = 0;
		//collect data by zones
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

		//calculate errors by their weight
		otherObjects.forEach(obj => {
			const zone = bellsCancellationController.getZone(obj.x , obj.y, additionalData.fieldWidth);
			if(!zone) return
			zoneStats[zone].wrongClicks +=1;
			//visual descrimination assessment
			if ([ 6, 8, 10, 11].includes(obj.type)) { //similar forms
				weightedErrors += 1;
			} else if ([4, 7, 9, 12].includes(obj.type)) { //average form similarity
				weightedErrors += 2;
			} else if ([1, 2, 3, 5, 13].includes(obj.type)) { //completely different forms
				weightedErrors += 3;
			}

		});
		//calculate visual descrimination
		let visualDiscriminationScore = (1 - (weightedErrors / maxWeightedErrors)) * 100;
		visualDiscriminationScore = Math.max(0, visualDiscriminationScore );
		
		//calculate overall result by zones
		const overallResult = bellsCancellationController.analyzeZones({
				totalObjects: additionalData.allObjectsCount,
				totalTargets: bellsObjects.length,
				missedTargets,
				totalTimeSeconds: duration,
				zoneStats,
				age
		})

		return {
			symmetryScore: overallResult.symmetryScore,
			asymmetryDirection: overallResult.asymmetryDirection,
			finalScore: overallResult.finalScore,
			visualDiscriminationScore,
		};

    }
}

export default bellsCancellationController;
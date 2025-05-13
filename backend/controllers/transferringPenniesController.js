/**
 * Author: Maryna Kucher
 * Description: Controller responsible for processing and storing results 
 * of the Transferring Pennies Test.
 * 
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import userModel from '../models/user.js';

const COINS_PER_ROUND = 9; //value for the implemented test
//(18 inches*20 coins/15 seconds ) * 0.4 (after testing changed to 4)
const REFERENCE_SPEED = 4; 



const transferringPenniesController ={

	// main method that calculates and stores the test result
	saveResponse: async (req, res) => {
		const {coinData, additionalData} = req.body;
		const user_id = req.user.id;

		if (!user_id || !coinData || !additionalData) {
			return res.status(400).json({ error: "Missing required fields" });
		}
		//--- assess speed ---
		const {round1, round2} = transferringPenniesController.assessOverall(additionalData);
		const finalScore = (round1+round2)/2;
		//--- assess bilateral coordination ---
		const features = transferringPenniesController.extractFeatures(coinData);
		const {resultLeft, resultRight} = transferringPenniesController.assessCoordination(features);
		
		try {
			//save to database
			await userModel.saveToDatabase(user_id, "movementSpeed", finalScore)
			await userModel.saveToDatabase(user_id, "bilateralCoordination", resultLeft)
			//return to user
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore.toFixed(2)}%`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}
		
	},

	//calculate distance between points
	distance : (point1, point2) => {
		return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
	},

	//extract features depending on active hand
	extractFeatures : (data) => {
		const results = [];
		//for each coin
		data.forEach(entry => {
			const handChange = entry.hand_change_points;
			//processing only data where hand change point is detected
			if (!handChange){
				return; 
			}  
		
			const coordStart = entry.start_coordinates;
			const coordEnd = entry.end_coordinates;
			const handChangeCoord = handChange;
			const timeStart = entry.time_start;
			const timeEnd = entry.time_end;
			const timeHandChange = handChangeCoord.time;
			const errors = entry.errors;
			const wholeDistance = transferringPenniesController.distance(coordStart, coordEnd);
			let paramsL, paramsR;

			if(entry.round == 1){
				//for the first round, the movement was performed with left hand 
				// before hand change point and right hand after
				paramsL = transferringPenniesController.calculateParams(coordStart, handChangeCoord, timeStart, timeHandChange, errors, wholeDistance);
				paramsR = transferringPenniesController.calculateParams(handChangeCoord,coordEnd, timeHandChange, timeEnd, errors, wholeDistance);	
			}else{
				//for the second round, the first was right hand, than left
				paramsR = transferringPenniesController.calculateParams(coordStart, handChangeCoord, timeStart, timeHandChange, errors, wholeDistance);
				paramsL = transferringPenniesController.calculateParams(handChangeCoord,coordEnd, timeHandChange, timeEnd, errors, wholeDistance);
			
			}
			
			const {speed: speedLeft, part: partLeft, errNum: errNumLeft,errTime: errTimeLeft} = paramsL;
			const {speed: speedRight, part: partRight, errNum: errNumRight,errTime: errTimeRight} = paramsR;
			//save result for each coin
			results.push({
				round: entry.round,
				speedLeft, speedRight,
				partLeft, partRight,
				errNumLeft, errNumRight,
				errTimeLeft, errTimeRight,			
			});
		
		});
		return results;
	},

	//calculate four params for left/right hand comparation 
	//(speed, part of path, errors number and time)
	calculateParams : (coordStart, coordEnd, timeStart, timeEnd, errors, wholeDistance) => {

		const errInZone = errors.filter(err => 
			Math.abs(err.x) > Math.abs(coordStart.x) && Math.abs(err.x) <= Math.abs(coordEnd.x));
        const errNum = errInZone.length;
        const errTime = errInZone.reduce((sum, err) => sum + err.time, 0);
		const timeDiff = timeEnd - timeStart - errTime;
        const speed = timeDiff > 0 ? transferringPenniesController.distance(coordStart, coordEnd) / timeDiff : 0;
		const part = transferringPenniesController.distance(coordStart, coordEnd) /wholeDistance;

		return { speed, part, errNum, errTime  }; 
	},

	//assess bilateral coordination using data from all coins
	assessCoordination: (dataArr) => {
		//speed, part, errors, errorsTime for each hand
		let totals = { left: [0, 0, 0, 0], right: [0, 0, 0, 0] };
		let errorsEntries = 0;
	
		dataArr.forEach(({ speedLeft, speedRight, partLeft, partRight, errNumLeft, errNumRight, errTimeLeft, errTimeRight }) => {
			//save the amount of moves where error occured
			if (errNumLeft > 0 || errNumRight > 0) {
				errorsEntries++;
			}
			//compare left to right and calculate total value for each indicator
			[speedLeft, partLeft, errNumLeft, errTimeLeft].forEach((leftVal, i) => {
				let rightVal = [speedRight, partRight, errNumRight, errTimeRight][i];
				//get percentage ration for each indicator
				let {percentage1, percentage2} = transferringPenniesController.percentageRatio(leftVal, rightVal);
				totals.left[i] += percentage1;
				totals.right[i] += percentage2;
				
			});
		});
	
		// calculate the mean
		const safeDiv = (val, div) => div === 0 ? 0 : val / div;

		// calculate arithmetic mean for each hand for each indicator
		const avgLeft = totals.left.map((val, i) => safeDiv(val, i < 2 ? dataArr.length : errorsEntries));
		const avgRight = totals.right.map((val, i) => safeDiv(val, i < 2 ? dataArr.length : errorsEntries));

		// get score from all indicators
		const scoreLeft = avgLeft[0] + avgLeft[1] + avgRight[2] + avgRight[3];
		const scoreRight = avgRight[0] + avgRight[1] + avgLeft[2] + avgLeft[3];

		// compare left to right
		let { percentage1, percentage2 } = transferringPenniesController.percentageRatio(scoreLeft, scoreRight);

		return { resultLeft: percentage1 , resultRight: percentage2  };
	},

	//assess test performance by original test score system
	assessOverall: (data) => {
		const round1Duration = (data.timeEndRound1 - data.timeStartRound1)/1000;
		const round2Duration = (data.timeEndRound2 - data.timeStartRound2)/1000;

		//reference speed = refPathWidth * refCoinsAmount / refTime
		const speedRound1 = COINS_PER_ROUND * data.width / round1Duration;
		const speedRound2 = COINS_PER_ROUND * data.width / round2Duration;
		//compare to reference speed and convert to percent
		const resultRound1 = (speedRound1 * 100) / REFERENCE_SPEED
		const resultRound2 = (speedRound2 * 100) / REFERENCE_SPEED

		
		return ({round1: resultRound1 , round2 : resultRound2 })

	},
	
	//calculate the percentage ratio of two values
	percentageRatio: (value1, value2) => {
		let total = value1 + value2; 
		if (total === 0) return { percentage1: 0, percentage2: 0 }; //avoid dividing by 0
		return { percentage1: (value1 * 100) / total, percentage2: (value2 * 100) / total };
	},

		
	};

	export default transferringPenniesController;
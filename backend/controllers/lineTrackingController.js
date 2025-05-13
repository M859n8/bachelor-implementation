/**
 * Author: Maryna Kucher
 * Description: Controller responsible for processing and storing results 
 * of the Line Tracking Test.
 * 
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import sharp from 'sharp';
import { PNG } from 'pngjs';

import userModel from '../models/user.js';


const LINE_WIDTH = 30; //template  line width

const lineTrackingController = {

	// main method that calculates and stores the test result
    saveResponse: async (req, res) => {
		const {userLinesRound1, userLinesRound2, templateLines, additionalData}= req.body;
        const user_id = req.user.id;

        if (!user_id || !userLinesRound1 || !userLinesRound2 || !templateLines || !additionalData  ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

		let accuracyRound1, accuracyRound2;
		try {
			//get result for each round			
			accuracyRound1 = await lineTrackingController.comparePaths(templateLines, userLinesRound1, additionalData)
			accuracyRound2 = await lineTrackingController.comparePaths(templateLines, userLinesRound2, additionalData)

		} catch(error){
			res.status(500).json({ error: "Image processing error" });
		}
		//normalize with path completion
		const finalScore = (accuracyRound1*additionalData.completionRound1 + accuracyRound2*additionalData.completionRound2 )/2 
		try {
			//save to db 
			await userModel.saveToDatabase(user_id, "movementAccuracy", finalScore)
			//send to user
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore.toFixed(2)}%`,
			});
		} catch (error) {
			res.status(500).json({ error: "Database error" });
		}

	},
	
	//creates svg and calls asssessment function
	comparePaths: async (templatePathD, userPathD, additionalData)=> {
		const width = additionalData.windowWidth;
		const height = additionalData.windowHeight;
		//width and height is the same as the device screen sizes
		//stroke-width the same as in the frontend 
		const templateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${templatePathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH}"/>
		</svg>`;

		const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${userPathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH/2}"/>
		</svg>`;

		const accuracyPercentage = await lineTrackingController.checkOutOfBounds(templateSvg, userSvg)

		return accuracyPercentage 

	},

	//convert svg to png and save to buffer
	convertToPng: async (fileSvg) => {
		const imageBuffer = await sharp(Buffer.from(fileSvg))
			.png()
			.ensureAlpha()
			.toBuffer();
		const imagePng = PNG.sync.read(imageBuffer);
		return imagePng;

	},

	//calculate the percentage of pixels outside the bounds
	checkOutOfBounds: async (templateSvg, userSvg) => {
		const templatePng = await lineTrackingController.convertToPng(templateSvg);
		const userPng = await lineTrackingController.convertToPng(userSvg);
	
		const { width, height } = templatePng;
		
		let outOfBoundsCount = 0;
		let totalUserDrawn = 0;
		//compare each pixel from template and user drawing
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const idx = (width * y + x) << 2; //each pixel = 4 bytes (RGBA)
	
				const templateAlpha = templatePng.data[idx + 3]; // template pixel transparency
				const userAlpha = userPng.data[idx + 3]; // user pixel transparency
	
				if (userAlpha > 0) { // if the user has drawn something here
					totalUserDrawn++;
	
					if (templateAlpha === 0) {
						// if there is nothing here in the template -> out of bounds
						outOfBoundsCount++;

						
					} 
				
				}
			
			}
		}
	
	
		const accuracyPercentage = Math.max(0, (1 - (outOfBoundsCount / totalUserDrawn)) * 100);
		return accuracyPercentage

	},
 
}
export default lineTrackingController;
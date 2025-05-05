import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import fs from 'fs';

import userModel from '../models/user.js';


const LINE_WIDTH = 30;

const lineTrackingController = {

	
    saveResponse: async (req, res) => {
		const {userLinesRound1, userLinesRound2, templateLines, additionalData}= req.body;
		// console.log('request body', req.body)
        const user_id = req.user.id;
        if (!user_id || !userLinesRound1 || !userLinesRound2 || !templateLines || !additionalData  ) {

            return res.status(400).json({ error: "Missing required fields" });
        }

		let accuracyRound1, accuracyRound2;
		try {

			
			accuracyRound1 = await lineTrackingController.comparePaths(templateLines, userLinesRound1, additionalData)
			accuracyRound2 = await lineTrackingController.comparePaths(templateLines, userLinesRound2, additionalData)

		} catch(error){
			res.status(500).json({ error: "Image processing error" });
		}

		const finalScore = (accuracyRound1*additionalData.completionRound1 + accuracyRound2*additionalData.completionRound2 )/2 
		try {
			await userModel.saveToDatabase(user_id, "movementAccuracy", finalScore)
			res.json({
				message: "Final score calculated",
				finalScore: `${finalScore}`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Database error" });
		}

	},
	 
	comparePaths: async (templatePathD, userPathD, additionalData)=> {
		const width = additionalData.windowWidth;
		const height = additionalData.windowHeight;

		// console.log('width and heigth', width, height)

		const templateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${templatePathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH}"/>
		</svg>`;

		const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${userPathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH/2}"/>
		</svg>`;

		// const bufferTemplate = await lineTrackingController.convertSvgToPng(templateSvg);
    	// const bufferUser = await lineTrackingController.convertSvgToPng(userSvg);
		const accuracyPercentage = await lineTrackingController.checkOutOfBounds(templateSvg, userSvg)

		// const accuracyPercentage = await lineTrackingController.compareImages(bufferTemplate, bufferUser);
		console.log('accuracy ', accuracyPercentage)
		return accuracyPercentage 

	},
	convertToPng: async (fileSvg) => {
		const imageBuffer = await sharp(Buffer.from(fileSvg))
			.png()
			.ensureAlpha()
			.toBuffer();
		const imagePng = PNG.sync.read(imageBuffer);
		return imagePng;

	},

	checkOutOfBounds: async (templateSvg, userSvg) => {
		const templatePng = await lineTrackingController.convertToPng(templateSvg);
		const userPng = await lineTrackingController.convertToPng(userSvg);
	
		const { width, height } = templatePng;
		// const visualization = new PNG({ width, height }); //debug
	
		let outOfBoundsCount = 0;
		let totalUserDrawn = 0;
	
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const idx = (width * y + x) << 2; // кожен піксель = 4 байти (RGBA)
	
				const templateAlpha = templatePng.data[idx + 3]; // прозорість шаблону
				const userAlpha = userPng.data[idx + 3]; // прозорість малюнка користувача
	
				if (userAlpha > 0) { // Якщо користувач тут щось намалював
					totalUserDrawn++;
	
					if (templateAlpha === 0) {
						// Якщо в шаблоні тут нічого немає → вихід за межі
						outOfBoundsCount++;

						//debug
						// visualization.data[idx] = 255; // Red
						// visualization.data[idx + 1] = 0; // Green
						// visualization.data[idx + 2] = 0; // Blue
						// visualization.data[idx + 3] = 255; // Alpha
					} 
					// else {
					// 	//debug
					// 	visualization.data[idx] = userPng.data[idx];
					// 	visualization.data[idx + 1] = userPng.data[idx + 1];
					// 	visualization.data[idx + 2] = userPng.data[idx + 2];
					// 	visualization.data[idx + 3] = 255;
					// }
				}
				// else {
				// 	// debug
				// 	visualization.data[idx] = 0;
				// 	visualization.data[idx + 1] = 0;
				// 	visualization.data[idx + 2] = 0;
				// 	visualization.data[idx + 3] = 0;
				// }
			
			}
		}
	
		// console.log('out of bounds', outOfBoundsCount, 'total user drawn', totalUserDrawn)
		const accuracyPercentage = Math.max(0, (1 - (outOfBoundsCount / totalUserDrawn)) * 100);

		// const visualizationBuffer = PNG.sync.write(visualization); //debug
		// fs.writeFileSync('visualization.png', visualizationBuffer); //debug
		return accuracyPercentage

	},
 
}
export default lineTrackingController;
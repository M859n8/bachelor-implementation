import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';

import Jimp from 'jimp'

import userModel from '../models/user.js';


const LINE_WIDTH = 30;

// const debugDir = path.resolve(__dirname, '../debug');

// // 1. Перевіряємо чи існує папка, якщо ні — створюємо
// if (!fs.existsSync(debugDir)) {
//     fs.mkdirSync(debugDir, { recursive: true });  // recursive дозволяє створювати вкладені папки
//     console.log('Папку debug створено.');
// }


const lineTrackingController = {

	
    saveResponse: async (req, res) => {
		console.log('got here')
		const {userLinesRound1, userLinesRound2, templateLines, additionalData}= req.body;
		// console.log('request body', req.body)
        const user_id = req.user.id;
        if (!user_id || !userLinesRound1 || !userLinesRound2 || !templateLines || !additionalData  ) {

            return res.status(400).json({ error: "Missing required fields" });
        }

		// console.log('userLines', userLines)
		// console.log('templateLines', templateLines)

		// const result = lineTrackingController.evaluateUserPath(userLines[0], templateLines, 10);
		// console.log('Точок загалом:', result.totalPoints);
		// console.log('У межах шаблону:', result.insideCount);
		// console.log('Точність малювання:', result.percentInside + '%');
		// console.log('Похибка:', result.percentOutside + '%');
		try {

			
			const accuracyRound1 = await lineTrackingController.comparePaths(templateLines, userLinesRound1, additionalData)
			const accuracyRound2 = await lineTrackingController.comparePaths(templateLines, userLinesRound2, additionalData)
		} catch(error){
			res.status(500).json({ error: "Image processing error" });
		}


		console.log('accuravy by round', accuracyRound1, accuracyRound2 )
		console.log('completion by round', additionalData.completionRound1, additionalData.completionRound2 )

		console.log('additional data', additionalData)
	
		const finalScore = (accuracyRound1*additionalData.completionRound1 + accuracyRound2*additionalData.completionRound2 )/2 
		console.log('final score', finalScore )

		

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

		console.log('width and heigth', width, height)

		const templateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${templatePathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH}"/>
		</svg>`;

		const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
			<path d="${userPathD}" stroke="black" fill="none" stroke-width="${LINE_WIDTH/2}"/>
		</svg>`;


		// sharp(Buffer.from(templateSvg))
		// .png()
		// // .toFile(path.join(debugDir, 'path_debug1.png'))
		// .toFile('./debug/path_debug.png')
		// .then(() => {
		// 	console.log('SVG перетворено в PNG!');
		// })
		// .catch(err => {
		// 	console.error('Помилка:', err);
		// });


		// sharp(Buffer.from(userSvg))
		// .png()
		// // .toFile(path.join(debugDir, 'path_debug1.png'))
		// .toFile('./debug/path_debug2.png')
		// .then(() => {
		// 	console.log('SVG перетворено в PNG!');
		// })
		// .catch(err => {
		// 	console.error('Помилка:', err);
		// });
		const bufferTemplate = await lineTrackingController.convertSvgToPng(templateSvg);
    	const bufferUser = await lineTrackingController.convertSvgToPng(userSvg);
		const accuracyPercentage = await lineTrackingController.compareImages(bufferTemplate, bufferUser);

		// const diffCanvas = createCanvas(width, height);
		// const diffCtx = diffCanvas.getContext('2d');
    	// const diff = diffCtx.createImageData(width, height);

		// const numDiffPixels = pixelmatch(
		// 	templateData.data,
		// 	userData.data,
		// 	diff.data,
		// 	width,
		// 	height,
		// 	{ threshold: 0.1 }
		// );
	
		// const totalUserPixels = userData.data.reduce((count, value, index) => {
		// 	if (index % 4 === 0 && value < 128) count++;
		// 	return count;
		// }, 0);
		// const accuracy = 1 - (numDiffPixels / totalUserPixels);

		// console.log('accuracy ', accuracy)
		return accuracyPercentage

	},
 
	
	convertSvgToPng: async (svgString) => {
		return sharp(Buffer.from(svgString))
		  .png()
		  .toBuffer(); // Повертаємо буфер замість запису в файл
	},
	
	compareImages:async (templateBuffer, userBuffer) =>{
		// Завантажуємо зображення в Jimp
		const templateJimp = await Jimp.read(templateBuffer);
		const userJimp = await Jimp.read(userBuffer);
	
		if (templateJimp.bitmap.width !== userJimp.bitmap.width || templateJimp.bitmap.height !== userJimp.bitmap.height) {
			console.log('Зображення мають різний розмір!');
			return;
		}
			
		let outOfBoundsCount = 0;
		let totalBlackPixels = 0;
		let outOfBoundsPixels = [];
		// Порівнюємо пікселі
		userJimp.scan(0, 0, userJimp.bitmap.width, userJimp.bitmap.height, (x, y, idx) => {
			const templatePixel = templateJimp.getPixelColor(x, y);
			const userPixel = userJimp.getPixelColor(x, y);
			if (userPixel === 255) {
				totalBlackPixels++; // Чорний піксель у шаблоні
			}
		
			if (templatePixel === 0 && userPixel === 255) {
				// console.log('temolate color', templatePixel)
				outOfBoundsCount++; // Якщо пікселі різні і на шаблоні не чорний, збільшуємо лічильник
				outOfBoundsPixels.push({ x, y });
			}
		});
		// console.log(`Чорних пікселів у шаблоні: ${totalBlackPixels}`);
		const errorPercentage = (outOfBoundsCount / totalBlackPixels) * 100;
		const accuracyPercentage = (1 - outOfBoundsCount / totalBlackPixels) * 100;

		console.log('accuracy percentage', accuracyPercentage)
		// console.log(`Помилкових пікселів: ${outOfBoundsCount}, відсоток помилок ${errorPercentage}`);

		// Можна порівняти їх, щоб оцінити результат

		// Створюємо нове зображення для відображення помилкових пікселів
		const outputImage = new Jimp(templateJimp.bitmap.width, templateJimp.bitmap.height, 0xFFFFFFFF); // Білий фон

		// Позначаємо помилкові пікселі червоним кольором
		outOfBoundsPixels.forEach(pixel => {
			outputImage.setPixelColor(0xFF0000FF, pixel.x, pixel.y); // Червоний колір (RGBA)
		});

		// Зберігаємо нове зображення з помилковими пікселями
		outputImage.write('./debug/outOfBoundsImage.png', (err) => {
			if (err) {
				console.error('Помилка при збереженні зображення:', err);
			} else {
				console.log('Зображення з помилковими пікселями збережено в файл: ./debug/outOfBoundsImage.png');
			}
		});

		return accuracyPercentage
	},
	
	

}
export default lineTrackingController;
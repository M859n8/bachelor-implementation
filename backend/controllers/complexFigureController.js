/**
 * Author: Maryna Kucher
 * Description: Controller responsible for processing and storing results 
 * of the Complex Figure Test.
 * 
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import fs from 'fs';
import userModel from '../models/user.js';

import {spawn} from 'child_process';

const complexFigureController = {

	// main method that calculates and stores the test result
    saveResponse: async (req, res) => {
        const user_id = req.user.id;
        const { svg } = req.body;

        if (!user_id || !svg) {

            return res.status(400).json({ error: "Missing required fields" });
        }
		//save user drawing
		fs.writeFileSync('./assets/originalDrawing.svg', svg, 'utf-8');

		// calling a Python script, passing the path to the SVG file
		const child = spawn('python3', ['../backend/MLmodels/complexFigure/main.py', './assets/originalDrawing.svg']);

		let output = '';
		// processing output from a Python script
		child.stdout.on('data', (data) => {
		   console.log(`stdout: ${data.toString()}`);
		   output += data.toString();
		});
		
		// process errors
		child.stderr.on('data', (data) => {
		   console.error(`stderr: ${data.toString()}`);
		});
	   
		// checking the completion of the process
		child.on('close', async (code) => {
			if (code === 0) {

				try {
					//convert result to percent
					let finalScore = parseFloat(output); 
					finalScore *= 100; 
					const finalScoreRounded = finalScore.toFixed(2); 
					//save result in database
					await userModel.saveToDatabase(user_id, "copyingObjects", finalScore)
					//send resukt to the frontend
					res.json({
						message: "Final score calculated",
						finalScore: `${finalScoreRounded}%`,
					});
				} catch (error) {
					console.error(error);
					res.status(500).json({ error: "Database error" });
				}
			} else {
				// Python process ended with error
				res.status(500).json({ error: 'Error processing SVG' });
			}
		});

    },

}

export default complexFigureController;
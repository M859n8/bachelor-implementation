import fs from 'fs';
import userModel from '../models/user.js';

import {spawn} from 'child_process';

const complexFigureController = {

    saveResponse: async (req, res) => {
        const user_id = req.user.id;
        const { svg } = req.body;

        if (!user_id || !svg) {

            return res.status(400).json({ error: "Missing required fields" });
        }

		fs.writeFileSync('./assets/originalDrawing.svg', svg, 'utf-8');

		// Calling a Python script, passing the path to the SVG file
		const child = spawn('python3', ['../backend/MLmodels/complexFigure/main.py', './assets/originalDrawing.svg']);

		let output = '';
		// Processing output from a Python script
		child.stdout.on('data', (data) => {
		   console.log(`stdout: ${data.toString()}`);
		   output += data.toString();
		});
		
		// Process errors
		child.stderr.on('data', (data) => {
		   console.error(`stderr: ${data.toString()}`);
		});
	   
		// Checking the completion of the process
		child.on('close', async (code) => {
			if (code === 0) {

				try {
					//convert result to percent
					let finalScore = parseFloat(output).toFixed(4);
					finalScore *= 100;
					//save result in database
					await userModel.saveToDatabase(user_id, "copyingObjects", finalScore)
					//send resukt to the frontend
					res.json({
						message: "Final score calculated",
						finalScore: `${finalScore}`,
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
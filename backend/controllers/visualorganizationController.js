// import connection from "../config/db.js";
import stringSimilarity from "string-similarity";

const correctAnswers = {
  1: ["ball", "tennis ball", "cut ball"],
//   2: ["cat", "kitten", "small cat"],
//   3: ["dog", "puppy", "small dog"],
};

const visualorganizationController ={
    saveResponse: (req, res) => {
        const {user_id, image_id, text_response } = req.body;
        if (!image_id || !text_response) {
            return res.status(400).json({ error: "Missing required fields" });
        }


        // Отримуємо правильні відповіді для картинки
        const possibleAnswers = correctAnswers[image_id];

        if (!possibleAnswers) {
        return res.status(404).json({ error: "No reference answers found for this image" });
        }

        // Обчислюємо відсоток схожості між відповіддю користувача та списком правильних варіантів
        const similarities = possibleAnswers.map((answer) =>
        stringSimilarity.compareTwoStrings(text_response.toLowerCase(), answer.toLowerCase())
        );

        const maxSimilarity = Math.max(...similarities);
        const correctnessPercentage = (maxSimilarity * 100).toFixed(2);

    },
    // calculateResults:  (req, res) => {

    // }

};

export default visualorganizationController;
// import connection from "../config/db.js";
import stringSimilarity from "string-similarity";
const userResponses = {}; // Тимчасове сховище відповідей користувачі
const correctAnswers = {
  1: ["ball", "tennis ball", "cut ball"],
  2: ["cat", "kitten", "small cat"],
  3: ["dog", "puppy", "small dog"],
  4: ["dog", "puppy", "small dog"],
  5: ["dog", "puppy", "small dog"],
  6: ["dog", "puppy", "small dog"],


};

const visualorganizationController ={
    // Збереження відповіді в локальний масив
  saveResponse: (req, res) => {
    console.log('got here');
    const { image_id, text_response } = req.body;
    const user_id = req.user.id;
    if (!user_id || !image_id || !text_response) {
      console.log(`error in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);

      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(`ok in params user: ${user_id}, image: ${image_id}, text: ${text_response}`);

    // Якщо ще немає запису для користувача – створюємо
    if (!userResponses[user_id]) {
      userResponses[user_id] = [];
    }

    // Зберігаємо відповідь у тимчасовий масив
    userResponses[user_id].push({ image_id, text_response });

    res.json({ message: "Response saved locally" });
  },

    // Обчислення загального % правильності і збереження в БД
  calculateResults: async (req, res) => {
    // const { user_id } = req.body;
    const user_id = req.user.id;


    if (!user_id || !userResponses[user_id]) {
      return res.status(400).json({ error: "No responses found for this user" });
    }

    let totalSimilarity = 0;
    let totalQuestions = userResponses[user_id].length;

    // Обчислюємо схожість для кожної відповіді
    userResponses[user_id].forEach(({ image_id, text_response }) => {
      const possibleAnswers = correctAnswers[image_id] || [];
      const similarities = possibleAnswers.map((answer) =>
        stringSimilarity.compareTwoStrings(text_response.toLowerCase(), answer.toLowerCase())
      );
      const maxSimilarity = Math.max(...similarities);
      totalSimilarity += maxSimilarity;
    });

    // Підраховуємо загальний % правильності
    const finalScore = ((totalSimilarity / totalQuestions) * 100).toFixed(2);

    try {
      // (Тут можна зберігати фінальний результат у базу)
      console.log(`User ${user_id} final score: ${finalScore}%`);

      // Очищаємо тимчасові відповіді користувача
      delete userResponses[user_id];

      res.json({
        message: "Final score calculated",
        finalScore: `${finalScore}%`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
    }
  },
};

export default visualorganizationController;
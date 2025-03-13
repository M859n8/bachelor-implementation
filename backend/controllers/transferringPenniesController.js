
const userResponses = {}; // Тимчасове сховище відповідей користувачі

const transferringPenniesController ={
    // Збереження відповіді в локальний масив
  saveResults: (req, res) => {
    console.log("got here");
    console.log("Request body: ", req.body);
    
    const  coinData  = req.body;
    const user_id = req.user.id;
    if (!user_id ) {
      console.log("Missing token");

      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!coinData) {
      console.log("Missing coin data");

      return res.status(400).json({ error: "Missing required fields" });
    }
     // Перевірка координат
    //  coinData.forEach(coin => {
    //   if (!coin.start_coordinates || !coin.start_coordinates.x || !coin.start_coordinates.y) {
    //       return res.status(400).json({ error: "Invalid start coordinates" });
    //   }else{
    //     console.log('valid1');
    //   }
    //   if (!coin.end_coordinates || !coin.end_coordinates.x || !coin.end_coordinates.y) {
    //       return res.status(400).json({ error: "Invalid end coordinates" });
    //   }else{
    //     console.log('valid2');

    //   }
  // });

    // Якщо ще немає запису для користувача – створюємо
    if (!userResponses[user_id]) {
      userResponses[user_id] = [];
    }

    // Зберігаємо відповідь у тимчасовий масив
    userResponses[user_id].push({coinData });
    // console.log("Data : ", coinData);
    console.log("Received Data: ", JSON.stringify(coinData, null, 2));


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

export default transferringPenniesController;
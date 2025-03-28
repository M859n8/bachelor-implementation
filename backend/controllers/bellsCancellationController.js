
// const userResponses = {}; // Тимчасове сховище відповідей користувачі


const bellsCancellationController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {bellsObjects, additionalData, otherObjects }= req.body;
        const user_id = req.user.id;
        if (!user_id || !bellsObjects || !additionalData) {

            return res.status(400).json({ error: "Missing required fields" });
        }

        // // Якщо ще немає запису для користувача – створюємо
        // if (!userResponses[user_id]) {
        //     userResponses[user_id] = [];
        // }

        // // Зберігаємо відповідь у тимчасовий масив
        // userResponses[user_id].push({ image_id, text_response });

        console.log("clicked obj", bellsObjects);
        console.log("additional data", additionalData);
        // try {
        //     const result = await calculateResults(bellsObjects, additionalData);  // Виконання обчислень асинхронно
            
        //     // Зберігаємо результат в базу даних
        //     // const response = await saveToDatabase(user_id, bellsObjects, additionalData, result);
            
        //     res.json({ message: "Response saved successfully", result });
        // } catch (error) {
        //     res.status(500).json({ error: "Failed to process the request" });
        // }

        res.json({ message: "Response saved locally" });

    },

    calculateResults: async (bellsObjects, additionalData) => {
		//можна розділити екран на кілька зон, визначити в яких зонах знаходяться елементи 
		// і визначити відсоток неглекту. це може бути осноаним показгиком тесту 
		/*  помилково натиснуті елементи покажуть здатністть розрізняти об'єкти за формами 
			і відрізняти об'єкт від фону 
			
			також впоиває порядоу натиснення елементів. можна переглянути чи змішуються зони . 
			типу чи не скаче взаємодія з елементами з однієї зони в іншу і тд.
			але не дуже зрозуміло як це оцінювати .немає визначеного правила з якої зони людина помивнна починати і тд 
			
			 
100
−
пропущені дзвіночки
+
кліки на зайві об’єкти
загальна кількість дзвіночків
×
100
100− 
загальна кількість дзвіночків
пропущені дзвіночки+кліки на зайві об’єкти
​
 ×10*/

    }

}

export default bellsCancellationController;
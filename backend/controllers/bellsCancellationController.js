
// const userResponses = {}; // Тимчасове сховище відповідей користувачі


const bellsCancellationController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {bellsObjects, additionalData }= req.body;
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
        console.log("additional fata", additionalData);
        try {
            const result = await calculateResults(bellsObjects, additionalData);  // Виконання обчислень асинхронно
            
            // Зберігаємо результат в базу даних
            // const response = await saveToDatabase(user_id, bellsObjects, additionalData, result);
            
            res.json({ message: "Response saved successfully", result });
        } catch (error) {
            res.status(500).json({ error: "Failed to process the request" });
        }

        // res.json({ message: "Response saved locally" });

    },

    calculateResults: async (bellsObjects, additionalData) => {

    }

}

export default bellsCancellationController;
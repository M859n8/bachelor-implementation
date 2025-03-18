
// const userResponses = {}; // Тимчасове сховище відповідей користувачі


const bellsCancellationController = {

    saveResponse: (req, res) => {
        console.log('got here');
        const {clickedObjects, correctObjects} = req.body;
        const user_id = req.user.id;
        if (!user_id || !clickedObjects || !correctObjects) {

            return res.status(400).json({ error: "Missing required fields" });
        }

        // // Якщо ще немає запису для користувача – створюємо
        // if (!userResponses[user_id]) {
        //     userResponses[user_id] = [];
        // }

        // // Зберігаємо відповідь у тимчасовий масив
        // userResponses[user_id].push({ image_id, text_response });

        console.log("clicked obj", clickedObjects);
        console.log("correct obj", correctObjects);


        res.json({ message: "Response saved locally" });

    }

}

export default bellsCancellationController;
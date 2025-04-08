const blockDesignController = {

    //Використання async/await забезпечить, що ваш сервер не буде блокуватися при виконанні обчислень.
    saveResponse: async (req, res) => {
        const {blocksGrid, additionalData}= req.body;
        const user_id = req.user.id;
        if (!user_id || !blocksGrid || !additionalData) {

            return res.status(400).json({ error: "Missing required fields" });
        }


        console.log("blocks", blocksGrid);
        console.log("additional data", additionalData);

        res.json({ message: "Response saved locally" });

    },

    calculateResults: async (bellsObjects, additionalData) => {


    }

}
export default blockDesignController;

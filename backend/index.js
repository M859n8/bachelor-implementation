const express = require('express');
// const cors = require('cors');
const connection = require('./db-config');
const authController = require('./controllers/authController');

const app = express();
const port = 5000; 

// app.use(cors());
app.use(express.json()); 



app.post('/register', authController.register);
app.post('/login', authController.login);


// Starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

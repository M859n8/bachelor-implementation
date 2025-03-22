import express from 'express';
import cors from 'cors';// const connection = require('./db-config');




const app = express(); // фреймворк для створення веб-сервера.

const port = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';


app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:8081', // Дозволяємо тільки запити від React Native Metro Bundler
//     methods: 'GET,POST,PUT,DELETE', //дозволені методи 
//     allowedHeaders: 'Content-Type,Authorization' //дозволені заголовки
//   }));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Server is running!');
  });
  
app.use('/api/auth', authRoutes);  //маршрути для аутентифікації 
app.use('/api/result', testRoutes); //маршрути для обробки тестів




// Starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); //при старті виводить це у консоль
});

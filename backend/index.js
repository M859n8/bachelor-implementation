import express from 'express';
import cors from 'cors';// const connection = require('./db-config');

const app = express();

const port = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';


// app.use(cors());
app.use(cors({
    origin: 'http://localhost:8081', // Дозволяємо тільки React Native Metro Bundler
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Server is running!');
  });
  
app.use('/api/auth', authRoutes);
app.use('/api/result', testRoutes);




// Starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

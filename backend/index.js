const express = require('express');
const cors = require('cors');
// const connection = require('./db-config');

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');

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
// app.post('/register', authController.register);
// app.post('/login', authController.login);


// Starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

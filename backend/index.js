/**
 * Author: Maryna Kucher
 * Description: Entry point for the backend server.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import express from 'express';
import cors from 'cors';


const app = express(); 

const port = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';


app.use(cors());
// Increase request body size limit (for comlex figure test)
app.use(express.json({ limit: '1mb' })); 

app.get('/', (req, res) => {
    res.send('Server is running!');
  });

// Authentication routes: Handle user authentication processes  
app.use('/api/auth', authRoutes);  
// Test routes: Manage test-related requests
app.use('/api/result', testRoutes); 


// Starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); 
});

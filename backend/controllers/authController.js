import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
const authController = {
  register: (req, res) => {
    // console.log("Received body:", req.body);

    const { username, password } = req.body;

    User.findByUsername(username, (err, results) => {
      if (err) return res.status(500).json({ error : "Database error"});
      if (results.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
      User.createUser(username, password, (err, userId) => {
        if (err) return res.status(500).json({ error: "Error creating user"});

        if (!userId) {
          return res.status(500).json({ error: "User ID is missing" });
        }

        // const userId = results.insertId;
        console.log("register body:", userId, username);
        const token = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Token:", token);

        return res.status(201).json({ token });
      });
    });
  },

  login: (req, res) => {
    // console.log("Received body:", req.body);

    const { username, password } = req.body;

    User.findByUsername(username, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error"});
      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid username or password"});
      }

      const user = results[0];
      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid username or password"});
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token });
      // return res.status(201).json({ message: "User logged successfully"});
    });
  },

  verify: (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true });
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
  }
};


export default authController; 

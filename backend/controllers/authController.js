const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const authController = {
  register: (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (err, results) => {
      if (err) return res.status(500).json({ error : "Database error"});
      if (results.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
      User.createUser(username, password, (err) => {
        if (err) return res.status(500).json({ error: "Error creating user"});
        return res.status(201).json({ message: "User created successfully"});
      });
    });
  },

  login: (req, res) => {
    console.log("Received body:", req.body);

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
  }
};

module.exports = authController;

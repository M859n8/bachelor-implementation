const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const authController = {
  register: (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (err, results) => {
      if (err) return res.status(500).send('Database error');
      if (results.length > 0) {
        return res.status(400).send('Username already exists');
      }

      User.createUser(username, password, (err) => {
        if (err) return res.status(500).send('Error creating user');
        return res.status(201).send('User created successfully');
      });
    });
  },

  login: (req, res) => {
    const { username, password } = req.body;

    User.findByUsername(username, (err, results) => {
      if (err) return res.status(500).send('Database error');
      if (results.length === 0) {
        return res.status(400).send('Invalid username or password');
      }

      const user = results[0];
      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        return res.status(400).send('Invalid username or password');
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token });
    });
  }
};

module.exports = authController;

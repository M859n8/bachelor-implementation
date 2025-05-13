/**
 * Author: Maryna Kucher
 * Description: Defines authentication-related API endpoints including user registration and login.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import express from 'express';
import authController from "../controllers/authController.js";
import authMiddleware from "../controllers/authMiddleware.js";
import userInfoController from "../controllers/userInfoController.js";

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

//check authentication endpoint
router.post('/check', authMiddleware, (req, res) => {
    res.json({ message: "User authenticated", user: req.user });
  });

//returns userinfo from database
router.post('/user-info',authMiddleware, userInfoController.getUserInfo);

export default router; 

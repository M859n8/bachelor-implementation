import express from 'express';
import authController from "../controllers/authController.js";
import authMiddleware from "../controllers/authMiddleware.js";
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verify);
router.post('/check', authMiddleware, (req, res) => {
    res.json({ message: "User authenticated", user: req.user });
  });


// module.exports = router;

export default router; 

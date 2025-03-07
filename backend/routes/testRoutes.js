import express from 'express';
import visualorganizationController from "../controllers/visualorganizationController.js";
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.post('/saveResponse',authMiddleware, visualorganizationController.saveResponse);
router.post('/calculateResults',authMiddleware, visualorganizationController.calculateResults);


// module.exports = router;

export default router; 
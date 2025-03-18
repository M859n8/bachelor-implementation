import express from 'express';
import visualorganizationController from "../controllers/visualorganizationController.js";
import transferringPenniesController from "../controllers/transferringPenniesController.js";
import bellsCancellationController from "../controllers/bellsCancellationController.js";


import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.post('/saveResponse',authMiddleware, visualorganizationController.saveResponse);
router.post('/calculateResults',authMiddleware, visualorganizationController.calculateResults);

router.post('/pennies/saveResults',authMiddleware, transferringPenniesController.saveResults);

router.post('/bells/saveResponse',authMiddleware, bellsCancellationController.saveResponse);



// module.exports = router;

export default router; 
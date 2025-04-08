import express from 'express';
import visualorganizationController from "../controllers/visualorganizationController.js";
import transferringPenniesController from "../controllers/transferringPenniesController.js";
import bellsCancellationController from "../controllers/bellsCancellationController.js";
import complexFigureController from "../controllers/complexFigureController.js";
import blockDesignController from "../controllers/blockDesignController.js";



import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.post('/saveResponse',authMiddleware, visualorganizationController.saveResponse);
router.post('/calculateResults',authMiddleware, visualorganizationController.calculateResults);

router.post('/pennies/saveResponse',authMiddleware, transferringPenniesController.saveResponse);

router.post('/bells/saveResponse',authMiddleware, bellsCancellationController.saveResponse);
router.post('/bels/saveResponse',authMiddleware, bellsCancellationController.saveResponse);



router.post('/figure/saveResponse',authMiddleware, complexFigureController.saveResponse);

router.post('/block/saveResponse',authMiddleware, blockDesignController.saveResponse);





// module.exports = router;

export default router; 
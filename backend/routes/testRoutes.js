import express from 'express';
import visualorganizationController from "../controllers/visualorganizationController.js";

const router = express.Router();

router.post('/saveResponse', visualorganizationController.saveResponse);
// router.post('/calculateResults', visualorganizationController.register);


// module.exports = router;

export default router; 
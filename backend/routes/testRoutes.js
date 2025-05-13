/**
 * Author: Maryna Kucher
 * Description: Routes for calculating results of different tests.
 * Each test is handled by a separate controller.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import express from 'express';
import visualorganizationController from "../controllers/visualorganizationController.js";
import transferringPenniesController from "../controllers/transferringPenniesController.js";
import bellsCancellationController from "../controllers/bellsCancellationController.js";
import complexFigureController from "../controllers/complexFigureController.js";
import blockDesignController from "../controllers/blockDesignController.js";
import lineTrackingController from "../controllers/lineTrackingController.js";


import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

// Each request for calculating test results goes through a middleware 
// that checks authentication and adds the user id to the request.
router.post('/visual/saveResponse',authMiddleware, visualorganizationController.saveResponse);

router.post('/pennies/saveResponse',authMiddleware, transferringPenniesController.saveResponse);

router.post('/bells/saveResponse',authMiddleware, bellsCancellationController.saveResponse);

router.post('/figure/saveResponse',authMiddleware, complexFigureController.saveResponse);

router.post('/block/saveResponse',authMiddleware, blockDesignController.saveResponse);

router.post('/line/saveResponse',authMiddleware, lineTrackingController.saveResponse);


export default router; 
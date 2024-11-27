import express from 'express';
import { validateQueryParams } from '../middleware/validateQueryParams.js';
import { getEpisodes } from '../controllers/episodesController.js';

const router = express.Router();

// Apply the validateQueryParams middleware to the '/episodes' route
router.get('/', validateQueryParams, getEpisodes); // Use '/' here to match the app.use('/episodes')

export default router;

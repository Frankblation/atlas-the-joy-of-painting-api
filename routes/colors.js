import express from 'express';
import { getColors } from '../controllers/colorsController.js';

const router = express.Router();

// GET /colors route
router.get('/', getColors);

export default router;

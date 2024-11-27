import express from 'express';
import { getSubjects } from '../controllers/subjectsController.js';


const router = express.Router();

// GET /subjects route
router.get('/', getSubjects);

export default router;

import express from 'express';
import dotenv from 'dotenv';
import episodesRoutes from './routes/episodes.js';
import subjectsRoutes from './routes/subjects.js';
import colorsRoutes from './routes/colors.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Use routes
app.use('/episodes', episodesRoutes);
app.use('/subjects', subjectsRoutes);
app.use('/colors', colorsRoutes);

// Use error handling middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

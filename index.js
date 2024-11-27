const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API routes go here
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

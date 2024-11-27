import pool from '../dbconfig.js';

export const getColors = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Colors');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching colors.', error: err.message });
    }
};

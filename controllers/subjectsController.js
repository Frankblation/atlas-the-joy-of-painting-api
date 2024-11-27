import pool from '../dbconfig.js';

export const getSubjects = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Subjects');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching subjects.', error: err.message });
    }
};
import pool from '../dbconfig.js';  // Import DB connection

// Existing function for filtering and paginated episodes
export const getEpisodes = async (req, res) => {
    try {
        const { month, subject, color, match, page = 1, pageSize = 10 } = req.query;
        const params = [];
        let query = `SELECT DISTINCT e.* FROM Episodes e`;
        let conditions = [];

        // Subject filtering logic
        if (subject) {
            query += `
                INNER JOIN Episode_Subject es ON e.id = es.episode_id
                INNER JOIN Subjects s ON es.subject_id = s.id`;
            conditions.push(`s.name ILIKE $${params.length + 1}`);
            params.push(`%${subject}%`);
        }

        // Color filtering logic
        if (color) {
            query += `
                INNER JOIN Episode_Color ec ON e.id = ec.episode_id
                INNER JOIN Colors c ON ec.color_id = c.id`;
            conditions.push(`c.name ILIKE $${params.length + 1}`);
            params.push(`%${color}%`);
        }

        // Month filtering logic
        if (month) {
            conditions.push(`EXTRACT(MONTH FROM e.air_date) = $${params.length + 1}`);
            params.push(month);
        }

        // Apply conditions to query
        if (conditions.length) {
            query += ` WHERE ` + conditions.join(match === 'all' ? ' AND ' : ' OR ');
        }

        // Add pagination
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, (page - 1) * pageSize);

        console.log('Executing query:', query, 'with params:', params);
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
    }
};

// New function to get a specific episode by ID
export const getEpisodeById = async (req, res) => {
    const episodeId = req.params.id;
    try {
        const query = 'SELECT * FROM Episodes WHERE id = $1';
        const result = await pool.query(query, [episodeId]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // Return the single episode
        } else {
            res.status(404).json({ message: 'Episode not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching the episode.', error: err.message });
    }
};

app.get('/episodes', async (req, res) => {
    try {
        const { month, subject, color, match } = req.query;
        let query = `SELECT DISTINCT e.* FROM Episodes e`;
        const params = [];
        let conditions = [];

        if (subject) {
            query += `
                INNER JOIN Episode_Subject es ON e.id = es.episode_id
                INNER JOIN Subjects s ON es.subject_id = s.id`;
            conditions.push(`s.name ILIKE $${params.length + 1}`);
            params.push(`%${subject}%`);
        }

        if (color) {
            query += `
                INNER JOIN Episode_Color ec ON e.id = ec.episode_id
                INNER JOIN Colors c ON ec.color_id = c.id`;
            conditions.push(`c.name ILIKE $${params.length + 1}`);
            params.push(`%${color}%`);
        }

        if (month) {
            conditions.push(`EXTRACT(MONTH FROM e.air_date) = $${params.length + 1}`);
            params.push(month);
        }

        if (conditions.length) {
            query += ` WHERE ` + conditions.join(match === 'all' ? ' AND ' : ' OR ');
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

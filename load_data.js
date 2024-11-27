import fs from 'fs';
import path from 'path';
import pool from './dbconfig.js';

export async function loadData(tableName, cleanedFile) {
    try {
        const client = await pool.connect(); // Get a client from the pool
        console.log(`Connected to ${process.env.DB_NAME}`);

        // Create table dynamically based on the tableName
        if (tableName === 'subject_matter') {
            await client.query('CREATE TABLE IF NOT EXISTS subject_matter (id SERIAL PRIMARY KEY, name VARCHAR(255))');
        }

        const data = fs.readFileSync(path.join(process.cwd(), cleanedFile), 'utf8');
        const rows = data.split('\n').slice(1);

        for (const row of rows) {
            const columns = row.split(',');
            await client.query(`INSERT INTO ${tableName} (name) VALUES ($1)`, [columns[0]]);
        }

        console.log(`Data loaded into ${tableName}`);
        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

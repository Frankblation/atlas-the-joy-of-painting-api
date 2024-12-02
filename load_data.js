import fs from 'fs';
import path from 'path';
import pool from './dbconfig.js';

export async function loadData(tableName, cleanedFile) {
    try {
        const client = await pool.connect();
        console.log(`Connected to ${process.env.DB_NAME}`);

        // Create table dynamically based on the tableName
        if (tableName === 'colors') {
            await client.query('CREATE TABLE IF NOT EXISTS colors (color_id SERIAL PRIMARY KEY, painting_id INTEGER, color_hex VARCHAR(255), color VARCHAR(255))');
        }

        const data = fs.readFileSync(path.join(process.cwd(), cleanedFile), 'utf8');
        const rows = data.split('\n').slice(1); // Skip the header row

        // Debug: Log rows to make sure they are being read correctly
        console.log(`Rows to insert: ${rows.length}`);
        
        for (const row of rows) {
            const columns = row.split(',');

            // Validate if columns are correctly parsed
            if (columns.length < 3) {
                console.warn(`Skipping invalid row: ${row}`);
                continue; // Skip invalid rows
            }

            const painting_id = columns[0];
            const color_hex = columns[1];
            const color = columns[2];

            // Insert data into colors table
            try {
                await client.query(`INSERT INTO ${tableName} (painting_id, color_hex, color) VALUES ($1, $2, $3)`, [painting_id, color_hex, color]);
                console.log(`Inserted painting_id ${painting_id} into ${tableName}`);
            } catch (err) {
                console.error('Error inserting row:', err);
            }
        }

        console.log(`Data loaded into ${tableName}`);
        client.release();
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

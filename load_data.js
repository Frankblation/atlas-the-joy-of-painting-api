import fs from 'fs';
import path from 'path';
import pool from './dbconfig.js';  // Your database connection configuration


// Function to load data into specific tables based on CSV files
async function loadData(tableName, cleanedFile) {
    try {
        const client = await pool.connect();
        console.log(`Connected to ${process.env.DB_NAME}`);

        // Create table dynamically based on the tableName (If needed)
        if (tableName === 'colors') {
            await client.query('CREATE TABLE IF NOT EXISTS colors (color_id SERIAL PRIMARY KEY, painting_id INTEGER, color_hex VARCHAR(255), color VARCHAR(255))');
        } else if (tableName === 'episodes') {
            await client.query('CREATE TABLE IF NOT EXISTS episodes (id SERIAL PRIMARY KEY, TITLE VARCHAR(255), description TEXT, air_date DATE)');
        } else if (tableName === 'subjects') {
            await client.query('CREATE TABLE IF NOT EXISTS subjects (id SERIAL PRIMARY KEY, name VARCHAR(255))');
        }

        // Read the CSV file
        const data = fs.readFileSync(path.join(process.cwd(), cleanedFile), 'utf8');
        const rows = data.split('\n').slice(1);  // Skip the header row

        // Debug: Log rows to make sure they are being read correctly
        console.log(`Rows to insert: ${rows.length}`);
        
        for (const row of rows) {
            const columns = row.split(',');

            // Validate if columns are correctly parsed
            if (columns.length < 3) {
                console.warn(`Skipping invalid row: ${row}`);
                continue; // Skip invalid rows
            }

            // Define values for columns based on table
            let insertQuery = '';
            let values = [];
            if (tableName === 'colors') {
                const painting_id = columns[0];
                const color_hex = columns[1];
                const color = columns[2];
                insertQuery = `INSERT INTO colors (painting_id, color_hex, color) VALUES ($1, $2, $3)`;
                values = [painting_id, color_hex, color];
            } else if (tableName === 'episodes') {
                const title = columns[0];
                const description = columns[1];
                const air_date = columns[2];
                insertQuery = `INSERT INTO episodes (title, description, air_date) VALUES ($1, $2, $3)`;
                values = [title, description, air_date];
            } else if (tableName === 'subjects') {
                const name = columns[0];
                insertQuery = `INSERT INTO subjects (name) VALUES ($1)`;
                values = [name];
            }

            // Insert data into the corresponding table
            try {
                await client.query(insertQuery, values);
                console.log(`Inserted row into ${tableName}`);
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

// Run the data loading process for each table
async function loadAllData() {
    console.log('Loading colors data...');
    await loadData('colors', 'Color_Used_cleaned.csv');

    console.log('Loading episodes data...');
    await loadData('episodes', 'Episode_Dates_cleaned.csv');

    console.log('Loading subjects data...');
    await loadData('subjects', 'subject_matter_cleaned.csv');
}

// Execute the loading process
loadAllData();

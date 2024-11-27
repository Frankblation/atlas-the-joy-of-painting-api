// setup.js
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg
// Load environment variables from .env file
dotenv.config();

// Get the database connection info from environment variables
const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

// Create a new Pool instance
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
});

// Get the current directory path using import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Path to the schema file
const schemaPath = path.join(__dirname, 'schema.sql');

// Read the SQL file
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Function to run the schema SQL
const runSchema = async () => {
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to the database.');

    // Execute the schema file
    await client.query(schema);
    console.log('Schema successfully created.');

    // Release the client connection
    client.release();
  } catch (error) {
    console.error('Error running schema:', error);
  } finally {
    // Close the pool
    pool.end();
  }
};

// Run the schema
runSchema();

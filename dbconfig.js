import pg from 'pg'; // Import the default export
const { Pool } = pg; // Destructure Pool from the default export
import dotenv from 'dotenv'; // Import dotenv to load environment variables

// Load environment variables from .env file
dotenv.config();

// Destructure database credentials from the environment variables
const { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } = process.env;

// Ensure DB_PORT is an integer, defaulting to 5432 if not provided
const port = parseInt(DB_PORT, 10) || 5432;

// Check if all required environment variables are set
if (!DB_USER || !DB_HOST || !DB_NAME || !DB_PASSWORD) {
  throw new Error('Missing required database environment variables.');
}

// Create a new pool instance using the provided configuration
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port,
});

// Test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    client.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the process if the connection fails
  }
}

// Test the database connection when this file is imported
testConnection();

export default pool;

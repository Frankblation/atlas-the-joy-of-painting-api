import dotenv from 'dotenv'; // Import dotenv
import pkg from 'pg';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

dotenv.config();  // Load .env file

const { Client } = pkg;

// Set up PostgreSQL client using environment variables
const client = new Client({
  host: process.env.DB_HOST, // Use environment variables
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to PostgreSQL
client.connect();

// Create the schema (table) if it doesn't exist
const createSchema = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS paintings (
      painting_index INT PRIMARY KEY,
      img_src TEXT,
      painting_title TEXT,
      season INT,
      episode INT,
      num_colors INT,
      youtube_src TEXT,
      colors JSONB,
      color_hex JSONB,
      Black_Gesso BOOLEAN,
      Bright_Red BOOLEAN,
      Burnt_Umber BOOLEAN,
      Cadmium_Yellow BOOLEAN,
      Dark_Sienna BOOLEAN,
      Indian_Red BOOLEAN,
      Indian_Yellow BOOLEAN,
      Liquid_Black BOOLEAN,
      Liquid_Clear BOOLEAN,
      Midnight_Black BOOLEAN,
      Phthalo_Blue BOOLEAN,
      Phthalo_Green BOOLEAN,
      Prussian_Blue BOOLEAN,
      Sap_Green BOOLEAN,
      Titanium_White BOOLEAN,
      Van_Dyke_Brown BOOLEAN,
      Yellow_Ochre BOOLEAN,
      Alizarin_Crimson BOOLEAN,
      episodeDate DATE,
      subjectMatter TEXT
    );
  `;

  try {
    await client.query(createTableQuery);
    console.log("Schema created successfully.");
  } catch (err) {
    console.error("Error creating schema:", err);
  }
};

// Read CSV data (or use a string with your data)
const csvData = readFileSync('combined_output.csv', 'utf-8'); // Ensure this path points to your actual CSV file

// Parse CSV data
const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
});

const insertData = async (data) => {
  for (let row of data) {
    // Parse the colors and color_hex columns (JSON to Array)
    const colors = JSON.parse(row.colors);
    const colorHex = JSON.parse(row.color_hex);

    // Convert other fields to the correct types (for example, booleans and date)
    const episodeDate = new Date(row.episodeDate);
    const subjectMatter = row.subjectMatter === '[object Object]' ? null : row.subjectMatter;

    // Construct query to insert data
    const query = `
      INSERT INTO paintings (
        painting_index, img_src, painting_title, season, episode, num_colors, 
        youtube_src, colors, color_hex, Black_Gesso, Bright_Red, Burnt_Umber, 
        Cadmium_Yellow, Dark_Sienna, Indian_Red, Indian_Yellow, Liquid_Black, 
        Liquid_Clear, Midnight_Black, Phthalo_Blue, Phthalo_Green, Prussian_Blue, 
        Sap_Green, Titanium_White, Van_Dyke_Brown, Yellow_Ochre, Alizarin_Crimson, 
        episodeDate, subjectMatter
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, $11, $12, 
        $13, $14, $15, $16, $17, 
        $18, $19, $20, $21, $22, $23, 
        $24, $25, $26, $27, $28, 
        $29
      )
    `;

    const values = [
      parseInt(row.painting_index),
      row.img_src,
      row.painting_title,
      row.season,
      parseInt(row.episode),
      parseInt(row.num_colors),
      row.youtube_src,
      colors,
      colorHex,
      Boolean(parseInt(row.Black_Gesso)),
      Boolean(parseInt(row.Bright_Red)),
      Boolean(parseInt(row.Burnt_Umber)),
      Boolean(parseInt(row.Cadmium_Yellow)),
      Boolean(parseInt(row.Dark_Sienna)),
      Boolean(parseInt(row.Indian_Red)),
      Boolean(parseInt(row.Indian_Yellow)),
      Boolean(parseInt(row.Liquid_Black)),
      Boolean(parseInt(row.Liquid_Clear)),
      Boolean(parseInt(row.Midnight_Black)),
      Boolean(parseInt(row.Phthalo_Blue)),
      Boolean(parseInt(row.Phthalo_Green)),
      Boolean(parseInt(row.Prussian_Blue)),
      Boolean(parseInt(row.Sap_Green)),
      Boolean(parseInt(row.Titanium_White)),
      Boolean(parseInt(row.Van_Dyke_Brown)),
      Boolean(parseInt(row.Yellow_Ochre)),
      Boolean(parseInt(row.Alizarin_Crimson)),
      episodeDate,
      subjectMatter,
    ];

    try {
      await client.query(query, values);
      console.log(`Inserted painting with index ${row.painting_index}`);
    } catch (err) {
      console.error(`Error inserting painting with index ${row.painting_index}:`, err);
    }
  }

  // Close the connection after inserting all records
  client.end();
};

// Run schema creation and then insert data
const setupAndInsertData = async () => {
  await createSchema();  // Create the schema (table)
  insertData(records);   // Insert data
};

setupAndInsertData();  // Run everything

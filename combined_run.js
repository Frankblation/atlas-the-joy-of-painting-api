// Import required modules
import fs from 'fs';
import pkg from 'pg';
import dotenv from 'dotenv';
import csvParser from 'csv-parser'; // To parse CSV files

const { Client } = pkg;
dotenv.config();

// Set up database client
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Read CSV file and return data as JSON
const readCsv = (path) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Setup and Insert Data into Database
const setupAndInsertData = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database.');

    // Load CSV data
    const episodesData = await readCsv('./Episode_Dates_cleaned_v2.csv');
    const paintingColorsData = await readCsv('./Color_Used_cleaned_v2.csv');
    const subjectMatterData = await readCsv('./subject_matter_cleaned.csv');

    console.log('CSV files loaded successfully.');

    // Create schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS episodes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        air_date DATE,
        description TEXT
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS paintings (
        id SERIAL PRIMARY KEY,
        painting_index INT,
        img_src TEXT,
        painting_title TEXT,
        season INT,
        episode INT,
        num_colors INT,
        youtube_src TEXT,
        colors TEXT,
        color_hex TEXT
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS subject_matter (
        id SERIAL PRIMARY KEY,
        episode TEXT,
        title TEXT,
        apple_frame INT,
        aurora_borealis INT,
        barn INT,
        beach INT,
        boat INT,
        bridge INT,
        building INT,
        bushes INT,
        cabin INT,
        cactus INT,
        circle_frame INT,
        cirrus INT,
        cliff INT,
        clouds INT,
        conifer INT,
        cumulus INT,
        deciduous INT,
        diane_andre INT,
        dock INT,
        double_oval_frame INT,
        farm INT,
        fence INT,
        fire INT,
        florida_frame INT,
        flowers INT,
        fog INT,
        framed INT,
        grass INT,
        guest INT,
        half_circle_frame INT,
        half_oval_frame INT,
        hills INT,
        lake INT,
        lakes INT,
        lighthouse INT,
        mill INT,
        moon INT,
        mountain INT,
        mountains INT,
        night INT,
        ocean INT,
        oval_frame INT,
        palm_trees INT,
        path INT,
        person INT,
        portrait INT,
        rectangle_3d_frame INT,
        rectangular_frame INT,
        river INT,
        rocks INT,
        seashell_frame INT,
        snow INT,
        snowy_mountain INT,
        split_frame INT,
        steve_ross INT,
        structure INT,
        sun INT,
        tomb_frame INT,
        tree INT,
        trees INT,
        triple_frame INT,
        waterfall INT,
        waves INT,
        windmill INT,
        window_frame INT,
        winter INT,
        wood_framed INT
      );
    `);

    // Insert data into episodes using parameterized queries
    for (const episode of episodesData) {
      const queryText = `
        INSERT INTO episodes (title, air_date, description)
        VALUES ($1, $2, $3)
      `;
      const values = [episode.title, episode['air date'], episode.description];
      console.log(queryText, values); // Log the query and values
      await client.query(queryText, values);
    }

    // Insert data into paintings using parameterized queries
    for (const painting of paintingColorsData) {
      const queryText = `
        INSERT INTO paintings (painting_index, img_src, painting_title, season, episode, num_colors, youtube_src, colors, color_hex)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      const values = [
        painting['painting index'],
        painting['img src'],
        painting['painting title'],
        painting['season'],
        painting['episode'],
        painting['num colors'],
        painting['youtube src'],
        painting['colors'],
        painting['color hex']
      ];
      console.log(queryText, values); // Log the query and values
      await client.query(queryText, values);
    }

    // Insert data into subject_matter using parameterized queries
    for (const subject of subjectMatterData) {
      // Ensure that all column names match the subject object keys
      const columnNames = [
        'episode', 'title', 'apple_frame', 'aurora_borealis', 'barn', 'beach', 'boat', 'bridge', 'building', 'bushes',
        'cabin', 'cactus', 'circle_frame', 'cirrus', 'cliff', 'clouds', 'conifer', 'cumulus', 'deciduous', 'diane_andre', 'dock',
        'double_oval_frame', 'farm', 'fence', 'fire', 'florida_frame', 'flowers', 'fog', 'framed', 'grass', 'guest', 'half_circle_frame',
        'half_oval_frame', 'hills', 'lake', 'lakes', 'lighthouse', 'mill', 'moon', 'mountain', 'mountains', 'night', 'ocean', 'oval_frame',
        'palm_trees', 'path', 'person', 'portrait', 'rectangle_3d_frame', 'rectangular_frame', 'river', 'rocks', 'seashell_frame', 'snow',
        'snowy_mountain', 'split_frame', 'steve_ross', 'structure', 'sun', 'tomb_frame', 'tree', 'trees', 'triple_frame', 'waterfall',
        'waves', 'windmill', 'window_frame', 'winter', 'wood_framed'
      ];

      const queryText = `
        INSERT INTO subject_matter (${columnNames.join(', ')})
        VALUES (${columnNames.map((_, index) => `$${index + 1}`).join(', ')})
      `;
      const values = columnNames.map(col => subject[col]);
      console.log(queryText, values); // Log the query and values
      await client.query(queryText, values);
    }

    console.log('Data inserted successfully.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close database connection
    await client.end();
    console.log('Database connection closed.');
  }
};

// Run the setup and insert function
setupAndInsertData();

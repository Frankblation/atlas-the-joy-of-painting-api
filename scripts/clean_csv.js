import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { promisify } from 'util';

// Promisify read/write functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Helper to clean text
const cleanText = (text) => {
  return text.toLowerCase().replace(/_/g, ' ').replace(/"/g, '').trim();
};

// Function to clean and save each file
const cleanAndSaveFile = async (inputPath, outputPath, standardizeHeaders) => {
  const rows = [];
  const parser = fs.createReadStream(inputPath).pipe(parse({ columns: true }));

  for await (const row of parser) {
    const cleanedRow = {};
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = standardizeHeaders ? cleanText(key) : key;
      cleanedRow[cleanKey] = cleanText(value);
    }
    rows.push(cleanedRow);
  }

  const fields = Object.keys(rows[0]);
  stringify(rows, { header: true, columns: fields }, async (err, output) => {
    if (err) throw err;
    await writeFile(outputPath, output);
    console.log(`Cleaned data saved to ${outputPath}`);
  });
};

// Function to combine files
const combineFiles = async (inputFiles, outputPath) => {
  const combinedData = [];
  const uniqueHeaders = new Set();

  for (const filePath of inputFiles) {
    const fileContent = await readFile(filePath, 'utf8');
    const parser = parse(fileContent, { columns: true });

    for await (const row of parser) {
      combinedData.push(row);
      Object.keys(row).forEach((header) => uniqueHeaders.add(header));
    }
  }

  // Deduplicate rows
  const deduplicatedData = Array.from(
    new Map(
      combinedData.map((row) => [
        row.title || row['painting title'] || JSON.stringify(row), // Use unique fields
        row,
      ])
    ).values()
  );

  // Create CSV with unique headers
  stringify(deduplicatedData, { header: true, columns: Array.from(uniqueHeaders) }, async (err, output) => {
    if (err) throw err;
    await writeFile(outputPath, output);
    console.log(`Combined data saved to ${outputPath}`);
  });
};

// Main function to orchestrate the process
const processAndExportData = async () => {
  const subjectMatterFile = 'Subject_Matter.csv';
  const colorsUsedFile = 'Color_Used_cleaned.csv';
  const episodeDatesFile = 'Episode_Dates_cleaned.csv';
  const combinedFile = 'Combined_Cleaned_Data.csv';

  // Clean individual files
  await cleanAndSaveFile(subjectMatterFile, 'Subject_Matter_cleaned.csv', true);
  await cleanAndSaveFile(colorsUsedFile, 'Color_Used_cleaned_v2.csv', true);
  await cleanAndSaveFile(episodeDatesFile, 'Episode_Dates_cleaned_v2.csv', true);

  // Combine cleaned files
  await combineFiles(
    ['Subject_Matter_cleaned.csv', 'Color_Used_cleaned_v2.csv', 'Episode_Dates_cleaned_v2.csv'],
    combinedFile
  );
};

// Run the script
processAndExportData().catch((err) => {
  console.error('Error processing data:', err);
});

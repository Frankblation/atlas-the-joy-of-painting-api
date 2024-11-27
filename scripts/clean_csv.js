import fs from 'fs';
import csvParser from 'csv-parser';
import csvStringify from 'csv-stringify/sync';

// Paths for the CSV files
const colorUsedFilePath = './Color_Used_cleaned.csv';
const episodeDatesFilePath = './Episode_Dates_cleaned.csv';
const subjectMatterFilePath = './subject_matter_cleaned.csv';
const inputFilePath = './input.csv'; // The original CSV to clean and combine

// Function to read and parse a CSV file
const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
};

// Function to clean colors and color_hex columns
const cleanArrayColumn = (column) => {
  if (column && column.startsWith('[') && column.endsWith(']')) {
    return column.replace(/"([^"]+)"/g, '\\"$1\\"');
  }
  return column;
};

// Function to clean and format the original input CSV
const cleanCsv = async () => {
  const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
  const records = csvParser.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Clean individual records
  const cleanRecord = (record) => {
    // Clean colors and color_hex columns
    record.colors = cleanArrayColumn(record.colors);
    record.color_hex = cleanArrayColumn(record.color_hex);

    // Fix subjectMatter column if it contains invalid values
    if (record.subjectMatter === '[object Object]') {
      record.subjectMatter = ''; // Replace with empty string or other value
    }

    return record;
  };

  return records.map(cleanRecord);
};

// Function to combine data from multiple CSV files
const combineData = async () => {
  try {
    const [colorUsedData, episodeDatesData, subjectMatterData] = await Promise.all([
      readCSVFile(colorUsedFilePath),
      readCSVFile(episodeDatesFilePath),
      readCSVFile(subjectMatterFilePath),
    ]);

    // Combine data logic here, matching episode titles
    const combinedData = colorUsedData.map((colorRow) => {
      const episodeTitle = colorRow.painting_title;
      const episodeDate = episodeDatesData.find((episode) => episode.TITLE === episodeTitle);
      const subjectMatter = subjectMatterData.find((subject) => subject.TITLE === episodeTitle);

      return {
        ...colorRow,
        episodeDate: episodeDate ? episodeDate.AIR_DATE : '',
        subjectMatter: subjectMatter || {},
      };
    });

    return combinedData;
  } catch (error) {
    console.error('Error combining data:', error);
    throw error;
  }
};

// Function to export data to a new CSV file
const exportDataToCSV = (data, outputFilePath) => {
  const header = Object.keys(data[0]).join(',') + '\n';
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(',')
    )
    .join('\n');

  const csvContent = header + rows;
  fs.writeFileSync(outputFilePath, csvContent, 'utf8');
};

// Main function to process and export the combined data
const processAndExportData = async () => {
  try {
    const cleanedCsvData = await cleanCsv(); // Clean the input CSV
    const combinedData = await combineData(); // Combine data from other CSVs

    // Now we combine the cleaned CSV data with the combined data
    const finalData = cleanedCsvData.map((row) => {
      const episodeTitle = row.painting_title;
      const additionalData = combinedData.find((data) => data.painting_title === episodeTitle);

      return {
        ...row,
        ...additionalData, // Add additional data (like subjectMatter and episodeDate)
      };
    });

    // Export the final combined and cleaned data to a CSV file
    exportDataToCSV(finalData, './final_combined_output.csv');
    console.log('Data has been processed and exported to final_combined_output.csv');
  } catch (error) {
    console.error('Error during processing:', error);
  }
};

// Run the processing
processAndExportData();

// Import necessary modules
import fs from 'fs';
import csvParser from 'csv-parser';

// Paths for the CSV files
const colorUsedFilePath = './Color_Used_cleaned.csv';
const episodeDatesFilePath = './Episode_Dates_cleaned.csv';
const subjectMatterFilePath = './subject_matter_cleaned.csv';

// Function to read andx parse a CSV file
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

// Function to combine data from multiple CSV files
const combineData = async () => {
  try {
    const [colorUsedData, episodeDatesData, subjectMatterData] = await Promise.all([
      readCSVFile(colorUsedFilePath),
      readCSVFile(episodeDatesFilePath),
      readCSVFile(subjectMatterFilePath),
    ]);

    // Combine data logic here. This will depend on how you want to merge these CSVs.
    // Example: Combine by matching episode titles
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

// Function to export combined data to a new CSV file
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

// Main function to process the CSV files and export the combined data
const processAndExportData = async () => {
  try {
    const combinedData = await combineData();
    exportDataToCSV(combinedData, './combined_output.csv');
    console.log('Data has been processed and exported to combined_output.csv');
  } catch (error) {
    console.error('Error during processing:', error);
  }
};

// Run the processing
processAndExportData();

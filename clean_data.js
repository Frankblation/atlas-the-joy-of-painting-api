import fs from 'fs';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

// Helper function to write data to CSV using @fast-csv/format
const writeToPath = (writeStream, rows, options) => {
    const csvStream = format(options);
    csvStream.pipe(writeStream); // Pipe CSV stream to write stream
    rows.forEach(row => csvStream.write(row));
    csvStream.end();
    return csvStream;
};

// Helper function to convert the "Month Day, Year" format to "YYYY-MM-DD"
function convertToDateString(dateStr) {
    const months = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
        'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };

    const match = dateStr.match(/([a-zA-Z]+) (\d{1,2}), (\d{4})/);
    if (match) {
        const month = months[match[1]];
        const day = match[2].padStart(2, '0'); // Ensure the day is two digits
        const year = match[3];
        return `${year}-${month}-${day}`; // Return the formatted date
    }
    return null; // Return null if the date format is not recognized
}

// 3. Clean the Episode_Dates.txt file and remove duplicates based on TITLE
async function cleanEpisodeData() {
    const cleanedRows = [];
    const seenTitles = new Set();  // To track unique titles
    const fileContent = fs.readFileSync('Episode_Dates.txt', 'utf-8');

    fileContent.split('\n').forEach((line) => {
        const match = line.match(/^"(.+)" \((.+)\)(?: - (.+))?$/);
        if (match) {
            const [_, title, airDate, description] = match;

            // Convert the airDate to a standard format
            const formattedDate = convertToDateString(airDate);

            if (formattedDate) {
                // If the title is unique, add it to the cleanedRows array
                if (!seenTitles.has(title)) {
                    seenTitles.add(title);  // Mark this title as seen
                    cleanedRows.push({
                        TITLE: title.trim(),
                        AIR_DATE: formattedDate, // Use the formatted date
                        DESCRIPTION: description ? description.trim() : '',
                    });
                }
            } else {
                console.error(`Invalid date format: ${airDate}`);
            }
        }
    });

    return new Promise((resolve, reject) => {
        // Write the cleaned data to a new CSV
        const writeStream = fs.createWriteStream('Episode_Dates_cleaned.csv');
        const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

        csvStream.on('finish', () => {
            console.log('Episode_Dates.txt cleaned and duplicates removed.');
            resolve();
        });
        csvStream.on('error', (err) => reject(err));
    });
}

// 1. Clean the subject_matter.csv file and remove duplicates based on TITLE
async function cleanSubjectMatter() {
    const cleanedRows = [];
    const seenTitles = new Set();  // To track unique titles

    return new Promise((resolve, reject) => {
        fs.createReadStream('subject_matter.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Clean the TITLE field
                row.TITLE = row.TITLE.replace(/"""|^\s+|\s+$/g, '').trim();

                // If the TITLE is unique, add it to the cleanedRows array
                if (!seenTitles.has(row.TITLE)) {
                    seenTitles.add(row.TITLE); // Mark this TITLE as seen
                    cleanedRows.push(row);     // Add the row to the cleaned array
                }
            })
            .on('end', () => {
                // Write the cleaned data to a new CSV
                const writeStream = fs.createWriteStream('subject_matter_cleaned.csv');
                const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

                csvStream.on('finish', () => {
                    console.log('subject_matter.csv cleaned and duplicates removed.');
                    resolve();
                });
                csvStream.on('error', (err) => reject(err));
            })
            .on('error', (err) => reject(err));
    });
}

// 2. Clean the Color_Used.csv file and remove duplicates based on color_hex
async function cleanColorUsed() {
    const cleanedRows = [];
    const seenColors = new Set();  // To track unique color_hex values

    return new Promise((resolve, reject) => {
        fs.createReadStream('Color_Used.csv')
            .pipe(csv())
            .on('data', (row) => {
                // Clean the color fields
                row.colors = row.colors.replace(/\\r\\n/g, '').replace(/'/g, '"');
                row.color_hex = row.color_hex.replace(/'/g, '"');

                // If the color_hex is unique, add it to the cleanedRows array
                if (!seenColors.has(row.color_hex)) {
                    seenColors.add(row.color_hex); // Mark this color_hex as seen
                    cleanedRows.push(row);          // Add the row to the cleaned array
                }
            })
            .on('end', () => {
                // Write the cleaned data to a new CSV
                const writeStream = fs.createWriteStream('Color_Used_cleaned.csv');
                const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

                csvStream.on('finish', () => {
                    console.log('Color_Used.csv cleaned and duplicates removed.');
                    resolve();
                });
                csvStream.on('error', (err) => reject(err));
            })
            .on('error', (err) => reject(err));
    });
}

// 4. Run all cleaning functions
async function main() {
    try {
        await cleanSubjectMatter();
        await cleanColorUsed();
        await cleanEpisodeData();
    } catch (error) {
        console.error('Error during data cleaning:', error);
    }
}

// Execute the cleaning process
main();
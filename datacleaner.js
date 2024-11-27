import fs from 'fs';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

// Helper to write data to CSV
export const writeToPath = (writeStream, rows, options) => {
    const csvStream = format(options);
    csvStream.pipe(writeStream);
    rows.forEach(row => csvStream.write(row));
    csvStream.end();
    return csvStream;
};

// Helper to convert date strings
export function convertToDateString(dateStr) {
    const months = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const match = dateStr.match(/([a-zA-Z]+) (\d{1,2}), (\d{4})/);
    if (match) {
        const month = months[match[1]];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
    }
    return null;
}

// Clean subject matter data
export async function cleanSubjectMatter() {
    const cleanedRows = [];
    const seenTitles = new Set();

    return new Promise((resolve, reject) => {
        fs.createReadStream('subject_matter.csv')
            .pipe(csv())
            .on('data', (row) => {
                row.TITLE = row.TITLE.replace(/"""|^\s+|\s+$/g, '').trim();

                if (!seenTitles.has(row.TITLE)) {
                    seenTitles.add(row.TITLE);
                    cleanedRows.push(row);
                }
            })
            .on('end', () => {
                const writeStream = fs.createWriteStream('subject_matter_cleaned.csv');
                const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

                csvStream.on('finish', () => resolve());
                csvStream.on('error', (err) => reject(err));
            })
            .on('error', (err) => reject(err));
    });
}

// Clean color data
export async function cleanColorUsed() {
    const cleanedRows = [];
    const seenColors = new Set();

    return new Promise((resolve, reject) => {
        fs.createReadStream('Color_Used.csv')
            .pipe(csv())
            .on('data', (row) => {
                row.colors = row.colors.replace(/\\r\\n/g, '').replace(/'/g, '"');
                row.color_hex = row.color_hex.replace(/'/g, '"');

                if (!seenColors.has(row.color_hex)) {
                    seenColors.add(row.color_hex);
                    cleanedRows.push(row);
                }
            })
            .on('end', () => {
                const writeStream = fs.createWriteStream('Color_Used_cleaned.csv');
                const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

                csvStream.on('finish', () => resolve());
                csvStream.on('error', (err) => reject(err));
            })
            .on('error', (err) => reject(err));
    });
}

// Clean episode data
export async function cleanEpisodeData() {
    const cleanedRows = [];
    const seenTitles = new Set();
    const fileContent = fs.readFileSync('Episode_Dates.txt', 'utf-8');

    fileContent.split('\n').forEach((line) => {
        const match = line.match(/^"(.+)" \((.+)\)(?: - (.+))?$/);
        if (match) {
            const [_, title, airDate, description] = match;

            const formattedDate = convertToDateString(airDate);

            if (formattedDate && !seenTitles.has(title)) {
                seenTitles.add(title);
                cleanedRows.push({
                    TITLE: title.trim(),
                    AIR_DATE: formattedDate,
                    DESCRIPTION: description ? description.trim() : '',
                });
            }
        }
    });

    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream('Episode_Dates_cleaned.csv');
        const csvStream = writeToPath(writeStream, cleanedRows, { headers: true });

        csvStream.on('finish', () => resolve());
        csvStream.on('error', (err) => reject(err));
    });
}

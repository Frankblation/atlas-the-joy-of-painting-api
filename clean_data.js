import { cleanSubjectMatter, cleanColorUsed, cleanEpisodeData } from './datacleaner.js';
import { loadData } from './load_data.js';

// Utility function for logging
function logWithTimestamp(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

async function main() {
    try {
        logWithTimestamp('Starting data cleaning...');
        
        // Execute cleaning tasks
        await cleanSubjectMatter();
        logWithTimestamp('Subject matter cleaned.');

        await cleanColorUsed();
        logWithTimestamp('Colors data cleaned.');

        await cleanEpisodeData();
        logWithTimestamp('Episode data cleaned.');

        logWithTimestamp('Data cleaning complete. Starting data loading...');
        
        // Load cleaned data into the database
        await loadData('subject_matter', 'subject_matter_cleaned.csv');
        logWithTimestamp('Subject matter data loaded.');

        // Add additional tables as needed
        await loadData('colors', 'Color_Used_cleaned.csv');
        logWithTimestamp('Colors data loaded.');

        await loadData('episodes', 'Episode_Dates_cleaned.csv');
        logWithTimestamp('Episode data loaded.');

        logWithTimestamp('All data processing complete.');
    } catch (error) {
        console.error('Error during data processing:', error);
    }
}

main();

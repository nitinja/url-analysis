/**
 * Script to add statistics to opportunity JSON files
 * 
 * This script reads an opportunity JSON file, calculates stats about the data,
 * and adds a "stats" object at the top with:
 * - totalUrls: total count of URLs across all opportunities
 * - count for each opportunity type
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add stats to a single opportunity file
 * @param {string} filePath - Path to the opportunity JSON file
 */
function addStatsToFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  // Calculate stats
  const stats = {
    totalUrls: 0
  };
  
  // Iterate through each opportunity type
  for (const [opportunityName, urls] of Object.entries(data)) {
    const urlCount = Array.isArray(urls) ? urls.length : 0;
    stats[opportunityName] = urlCount;
    stats.totalUrls += urlCount;
  }
  
  // Create new object with stats first
  const updatedData = {
    stats: stats,
    ...data
  };
  
  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
  
  console.log(`✓ Added stats: ${stats.totalUrls} total URLs across ${Object.keys(data).length} opportunity types`);
  console.log('');
}

/**
 * Process all opportunity files in a directory
 * @param {string} dirPath - Path to the directory containing opportunity files
 */
function addStatsToDirectory(dirPath) {
  console.log(`Processing all files in: ${dirPath}\n`);
  
  // Read all files in the directory
  const files = fs.readdirSync(dirPath);
  
  // Filter for JSON files
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} JSON files\n`);
  
  // Process each file
  jsonFiles.forEach(file => {
    const filePath = path.join(dirPath, file);
    try {
      addStatsToFile(filePath);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
      console.log('');
    }
  });
  
  console.log(`Finished processing ${jsonFiles.length} files`);
}

// Main execution
// Check if this file is being run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node add-stats-to-opportunities.js <file-or-directory-path>');
    console.log('');
    console.log('Examples:');
    console.log('  node add-stats-to-opportunities.js output/opportunities-links/wilson.com_68ba8c72-aab1-4a45-8bcc-79368d45caa4_opportunities.json');
    console.log('  node add-stats-to-opportunities.js output/opportunities-links/');
    process.exit(1);
  }
  
  const targetPath = args[0];
  
  // Check if path exists
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  // Check if it's a file or directory
  const stats = fs.statSync(targetPath);
  
  if (stats.isDirectory()) {
    addStatsToDirectory(targetPath);
  } else if (stats.isFile()) {
    addStatsToFile(targetPath);
  } else {
    console.error(`Error: Path is neither a file nor a directory: ${targetPath}`);
    process.exit(1);
  }
}

// Export functions for use as module
export { addStatsToFile, addStatsToDirectory };


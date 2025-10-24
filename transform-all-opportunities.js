// Script to transform all opportunities files in batch
// From: { "opportunity": ["url1", "url2"] }
// To: { "url1": ["opportunity1", "opportunity2"] }

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Transform opportunities data from opportunity-centric to URL-centric structure
 * This function ensures each URL appears only once with all associated opportunities
 * and removes duplicate opportunities for the same URL
 * 
 * @param {Object} opportunitiesData - Original data with opportunities as keys
 * @returns {Object} Transformed data with URLs as keys
 */
function transformOpportunities(opportunitiesData) {
  const urlToOpportunities = {};
  
  // Iterate through each opportunity type
  for (const [opportunityName, urls] of Object.entries(opportunitiesData)) {
    // For each URL in the opportunity's array
    for (const url of urls) {
      // Initialize set if this URL hasn't been seen yet
      if (!urlToOpportunities[url]) {
        urlToOpportunities[url] = new Set();
      }
      
      // Add the opportunity name to this URL's set (automatically handles duplicates)
      urlToOpportunities[url].add(opportunityName);
    }
  }
  
  // Convert Sets back to Arrays for JSON serialization
  const result = {};
  for (const [url, opportunitiesSet] of Object.entries(urlToOpportunities)) {
    result[url] = Array.from(opportunitiesSet);
  }
  
  return result;
}

/**
 * Process a single opportunities file
 * 
 * @param {string} inputFilePath - Path to input file
 * @param {string} outputFilePath - Path to output file
 * @returns {Object} Stats about the transformation
 */
function processFile(inputFilePath, outputFilePath) {
  try {
    // Read the input file
    const inputData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    
    // Transform the data
    const transformedData = transformOpportunities(inputData);
    
    // Calculate stats
    const totalUrls = Object.keys(transformedData).length;
    const totalOpportunityTypes = Object.keys(inputData).length;
    const urlsWithMultipleOpportunities = Object.values(transformedData).filter(
      opps => opps.length > 1
    ).length;
    
    // Write the output file
    fs.writeFileSync(outputFilePath, JSON.stringify(transformedData, null, 2), 'utf8');
    
    return {
      success: true,
      totalUrls,
      totalOpportunityTypes,
      urlsWithMultipleOpportunities
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
const inputDir = path.join(__dirname, 'output/opportunities-links');
const outputDir = path.join(__dirname, 'output/links-opportunities');

try {
  console.log('Starting batch transformation...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}\n`);
  }
  
  // Read all files from input directory
  const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));
  
  console.log(`Found ${files.length} JSON files to process\n`);
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  // Process each file
  for (const filename of files) {
    const inputFilePath = path.join(inputDir, filename);
    const outputFilePath = path.join(outputDir, filename);
    
    console.log(`\nProcessing: ${filename}`);
    
    const result = processFile(inputFilePath, outputFilePath);
    
    if (result.success) {
      successCount++;
      console.log(`  ✓ Success`);
      console.log(`    - Total unique URLs: ${result.totalUrls}`);
      console.log(`    - Opportunity types: ${result.totalOpportunityTypes}`);
      console.log(`    - URLs with multiple opportunities: ${result.urlsWithMultipleOpportunities}`);
      
      results.push({
        filename,
        ...result
      });
    } else {
      failCount++;
      console.log(`  ✗ Failed: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nBatch Transformation Summary');
  console.log('='.repeat(80));
  console.log(`Total files processed: ${files.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  // Calculate aggregate statistics
  const totalUrls = results.reduce((sum, r) => sum + r.totalUrls, 0);
  const totalUrlsWithMultiple = results.reduce((sum, r) => sum + r.urlsWithMultipleOpportunities, 0);
  
  console.log(`\nAggregate Statistics:`);
  console.log(`  - Total unique URLs across all files: ${totalUrls}`);
  console.log(`  - Total URLs with multiple opportunities: ${totalUrlsWithMultiple}`);
  console.log(`\n✓ All files saved to: ${outputDir}`);
  
} catch (error) {
  console.error('Error during batch transformation:', error.message);
  process.exit(1);
}


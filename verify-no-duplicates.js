// Script to verify and ensure no duplicate opportunities exist in transformed files
// Checks each URL's opportunity array for duplicates and fixes them if found

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if an array has duplicates
 * @param {Array} arr - Array to check
 * @returns {boolean} True if duplicates exist
 */
function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}

/**
 * Find duplicate values in an array
 * @param {Array} arr - Array to check
 * @returns {Array} Array of duplicate values
 */
function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  }
  
  return Array.from(duplicates);
}

/**
 * Remove duplicates from opportunity arrays in the data
 * @param {Object} data - The URL-to-opportunities data
 * @returns {Object} Cleaned data with statistics
 */
function removeDuplicates(data) {
  let urlsWithDuplicates = 0;
  let totalDuplicatesRemoved = 0;
  const duplicateExamples = [];
  
  const cleanedData = {};
  
  for (const [url, opportunities] of Object.entries(data)) {
    if (hasDuplicates(opportunities)) {
      urlsWithDuplicates++;
      const duplicates = findDuplicates(opportunities);
      const originalCount = opportunities.length;
      
      // Remove duplicates by converting to Set and back to Array
      cleanedData[url] = Array.from(new Set(opportunities));
      
      const removedCount = originalCount - cleanedData[url].length;
      totalDuplicatesRemoved += removedCount;
      
      // Store first 5 examples for reporting
      if (duplicateExamples.length < 5) {
        duplicateExamples.push({
          url,
          duplicates,
          originalCount,
          cleanedCount: cleanedData[url].length
        });
      }
    } else {
      cleanedData[url] = opportunities;
    }
  }
  
  return {
    cleanedData,
    urlsWithDuplicates,
    totalDuplicatesRemoved,
    duplicateExamples
  };
}

/**
 * Process a single file to check and fix duplicates
 * @param {string} filePath - Path to the file
 * @returns {Object} Processing results
 */
function processFile(filePath) {
  try {
    // Read the file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const totalUrls = Object.keys(data).length;
    
    // Check and remove duplicates
    const result = removeDuplicates(data);
    
    // Write back if duplicates were found
    if (result.urlsWithDuplicates > 0) {
      fs.writeFileSync(filePath, JSON.stringify(result.cleanedData, null, 2), 'utf8');
    }
    
    return {
      success: true,
      totalUrls,
      ...result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
const targetDir = path.join(__dirname, 'output/links-opportunities');

try {
  console.log('Starting duplicate check and cleanup...\n');
  console.log('=' .repeat(80));
  
  // Read all files from directory
  const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.json'));
  
  console.log(`Found ${files.length} JSON files to check\n`);
  
  let totalFilesWithDuplicates = 0;
  let totalUrlsWithDuplicates = 0;
  let totalDuplicatesRemoved = 0;
  const allExamples = [];
  
  // Process each file
  for (const filename of files) {
    const filePath = path.join(targetDir, filename);
    
    const result = processFile(filePath);
    
    if (result.success) {
      if (result.urlsWithDuplicates > 0) {
        totalFilesWithDuplicates++;
        totalUrlsWithDuplicates += result.urlsWithDuplicates;
        totalDuplicatesRemoved += result.totalDuplicatesRemoved;
        
        console.log(`\n${filename}`);
        console.log(`  ⚠️  Found duplicates in ${result.urlsWithDuplicates} URLs`);
        console.log(`  ✓ Removed ${result.totalDuplicatesRemoved} duplicate entries`);
        console.log(`  Total URLs: ${result.totalUrls}`);
        
        if (result.duplicateExamples.length > 0) {
          console.log(`  Examples:`);
          result.duplicateExamples.slice(0, 2).forEach(ex => {
            console.log(`    - ${ex.url.substring(0, 60)}...`);
            console.log(`      Duplicates: [${ex.duplicates.join(', ')}]`);
            console.log(`      Count: ${ex.originalCount} → ${ex.cleanedCount}`);
          });
        }
        
        allExamples.push(...result.duplicateExamples);
      }
    } else {
      console.log(`\n${filename}`);
      console.log(`  ✗ Error: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nDuplicate Check Summary');
  console.log('='.repeat(80));
  
  if (totalFilesWithDuplicates === 0) {
    console.log('\n✓ No duplicates found! All files are clean.');
  } else {
    console.log(`\nFiles with duplicates: ${totalFilesWithDuplicates} of ${files.length}`);
    console.log(`URLs with duplicates: ${totalUrlsWithDuplicates}`);
    console.log(`Total duplicates removed: ${totalDuplicatesRemoved}`);
    console.log(`\n✓ All duplicates have been removed and files updated.`);
    
    if (allExamples.length > 0) {
      console.log(`\nTop Examples of Duplicates Removed:`);
      allExamples.slice(0, 5).forEach((ex, i) => {
        console.log(`\n${i + 1}. ${ex.url.substring(0, 70)}...`);
        console.log(`   Duplicate opportunities: [${ex.duplicates.join(', ')}]`);
        console.log(`   Cleaned: ${ex.originalCount} → ${ex.cleanedCount} entries`);
      });
    }
  }
  
  console.log(`\n✓ Verification complete for: ${targetDir}`);
  
} catch (error) {
  console.error('Error during verification:', error.message);
  process.exit(1);
}


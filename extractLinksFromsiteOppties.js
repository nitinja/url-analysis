// Script to recursively traverse JSON and extract values for specific keys
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target keys to search for
const targetKeys = ['pageUrl', 'urlFrom', 'url', 'url_from', 'page'];

/**
 * Recursively traverse an object or array and collect values for specified keys
 * @param {*} obj - The object/array to traverse
 * @param {Set} results - Set to store found values (avoids duplicates)
 * @param {string} currentPath - Current path in the object tree (for debugging)
 * @returns {Set} Set containing all found values with their metadata
 */
function extractValues(obj, results = new Set(), currentPath = 'root') {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return results;
  }

  // Handle arrays - recursively process each element
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractValues(item, results, `${currentPath}[${index}]`);
    });
    return results;
  }

  // Handle objects
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = `${currentPath}.${key}`;
      
      // Check if this key is one of our target keys
      if (targetKeys.includes(key)) {
        // Only add non-null, non-undefined values
        if (value !== null && value !== undefined) {
          // Store the value along with its key and path for context
          results.add(JSON.stringify({
            key: key,
            value: value,
            path: newPath
          }));
        }
      }
      
      // Recursively traverse nested objects/arrays
      if (typeof value === 'object') {
        extractValues(value, results, newPath);
      }
    }
  }

  return results;
}

/**
 * Main function to extract and analyze links from JSON file
 * Reads the JSON file, extracts values for target keys, consolidates them,
 * and filters by domain
 * @param {string} domain - The domain to filter links by
 * @param {string} filePath - The path to the JSON file to analyze
 * @param {string} siteId - The site ID for the file
 * @returns {Object} Analysis results with domain, siteId, and extracted links
 */
function extractAndAnalyzeLinks(domain, filePath, siteId) {
  try {
    console.log('Reading file:', filePath);
    console.log('Target keys:', targetKeys.join(', '));
    console.log('---\n');
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON content
    const data = JSON.parse(fileContent);
    
    // Extract all values for target keys
    const results = extractValues(data);
    
    // Convert Set back to array and parse JSON strings
    const parsedResults = Array.from(results).map(item => JSON.parse(item));
    
    // Group results by key for better readability
    const groupedByKey = {};
    parsedResults.forEach(item => {
      if (!groupedByKey[item.key]) {
        groupedByKey[item.key] = [];
      }
      groupedByKey[item.key].push({
        value: item.value,
        path: item.path
      });
    });
    
    // Print results grouped by key
    console.log(`Total matches found: ${parsedResults.length}\n`);
    
    for (const [key, items] of Object.entries(groupedByKey)) {
      console.log(`\n=== Key: "${key}" (${items.length} occurrences) ===`);
      items.forEach((item, index) => {
        console.log(`\n[${index + 1}] Value: ${item.value}`);
        console.log(`    Path: ${item.path}`);
      });
    }
    
    // Print unique values per key
    console.log('\n\n=== UNIQUE VALUES PER KEY ===\n');
    for (const [key, items] of Object.entries(groupedByKey)) {
      const uniqueValues = [...new Set(items.map(item => item.value))];
      console.log(`\n"${key}": ${uniqueValues.length} unique values`);
      uniqueValues.forEach((value, index) => {
        console.log(`  ${index + 1}. ${value}`);
      });
    }
    
    // Consolidate all values from all keys into a single array
    console.log('\n\n=== CONSOLIDATED UNIQUE VALUES (ALL KEYS COMBINED) ===\n');
    
    // Collect all values from all keys into a single array
    const allValues = parsedResults.map(item => item.value);
    console.log(`Total values found across all keys: ${allValues.length}`);
    
    // Find unique values across all keys
    const uniqueConsolidatedValues = [...new Set(allValues)];
    console.log(`Unique values across all keys: ${uniqueConsolidatedValues.length}\n`);
    
    // Print all unique consolidated values
    uniqueConsolidatedValues.forEach((value, index) => {
      console.log(`${index + 1}. ${value}`);
    });
    
    // Show breakdown of which keys contributed to the consolidated list
    console.log('\n\n=== BREAKDOWN BY KEY ===');
    for (const [key, items] of Object.entries(groupedByKey)) {
      const keyUniqueValues = [...new Set(items.map(item => item.value))];
      console.log(`\n"${key}": ${items.length} total occurrences, ${keyUniqueValues.length} unique values`);
    }
    
    // Filter links by domain
    console.log('\n\n=== FILTERED BY DOMAIN ===');
    console.log(`Filtering for domain: "${domain}"\n`);
    
    // Filter unique values that contain the domain
    const filteredValues = uniqueConsolidatedValues.filter(value => {
      // Convert value to string and check if it contains the domain (case-insensitive)
      const valueStr = String(value).toLowerCase();
      return valueStr.includes(domain.toLowerCase());
    });
    
    // Process filtered values to remove HTTP/HTTPS prefixes
    const processedFilteredValues = filteredValues.map(value => {
      let processedValue = String(value);
      
      // Remove https:// prefix
      if (processedValue.toLowerCase().startsWith('https://')) {
        processedValue = processedValue.substring(8);
      }
      
      // Remove http:// prefix
      if (processedValue.toLowerCase().startsWith('http://')) {
        processedValue = processedValue.substring(7);
      }

      // Remove www. prefix if present at the beginning of the value (case-insensitive)
      // This ensures that links are normalized and do not start with "www."
      if (processedValue.toLowerCase().startsWith('www.')) {
        processedValue = processedValue.substring(4);
      }
      
      return processedValue;
    });
    
    console.log(`Unique values containing "${domain}": ${filteredValues.length}\n`);
    
    // Print processed filtered values
    processedFilteredValues.forEach((value, index) => {
      console.log(`${index + 1}. ${value}`);
    });
    
    // Show statistics
    console.log('\n\n=== FILTERING STATISTICS ===');
    console.log(`Total unique values: ${uniqueConsolidatedValues.length}`);
    console.log(`Values containing "${domain}": ${filteredValues.length}`);
    console.log(`Values NOT containing "${domain}": ${uniqueConsolidatedValues.length - filteredValues.length}`);
    console.log(`Percentage matching domain: ${((filteredValues.length / uniqueConsolidatedValues.length) * 100).toFixed(2)}%`);
    
    // Return structured results for file output
    return {
      domain: domain,
      siteId: siteId,
      filePath: filePath,
      extractedLinks: processedFilteredValues
    };
    
  } catch (error) {
    console.error('Error reading or parsing file:', error.message);
    return {
      domain: domain,
      siteId: siteId,
      filePath: filePath,
      timestamp: new Date().toISOString(),
      error: error.message,
      extractedLinks: null
    };
  }
}

/**
 * Clean domain name by removing www, http, https prefixes
 * @param {string} baseURL - The base URL to clean
 * @returns {string} Cleaned domain name
 */
function cleanDomain(baseURL) {
  let domain = baseURL.toLowerCase();
  
  // Remove www. prefix
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  
  // Remove http:// prefix
  if (domain.startsWith('http://')) {
    domain = domain.substring(7);
  }
  
  // Remove https:// prefix
  if (domain.startsWith('https://')) {
    domain = domain.substring(8);
  }
  
  return domain;
}

/**
 * Generate unique filename with timestamp and domain
 * @param {string} domain - The domain name
 * @param {string} siteId - The site ID
 * @returns {string} Unique filename
 */
function generateUniqueFilename(domain, siteId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
  return `extracted-links_${cleanDomain}_${siteId}_${timestamp}.json`;
}

/**
 * Process all opportunity files with their corresponding domains
 */
function processAllOpportunityFiles() {
  try {
    // Read customer sites data to get domain mappings
    const customerSitesPath = path.join(__dirname, 'output', 'customer-sites-ids.json');
    const customerSitesData = JSON.parse(fs.readFileSync(customerSitesPath, 'utf8'));
    
    // Create a mapping of ID to cleaned domain
    const idToDomainMap = {};
    customerSitesData.forEach(site => {
      const cleanedDomain = cleanDomain(site.baseURL);
      idToDomainMap[site.id] = cleanedDomain;
    });
    
    console.log('Customer sites loaded:', Object.keys(idToDomainMap).length);
    console.log('Domain mappings:', idToDomainMap);
    console.log('---\n');
    
    // Read all files in the opportunities directory
    const opportunitiesDir = path.join(__dirname, 'output', 'opportunities');
    const files = fs.readdirSync(opportunitiesDir);
    
    // Filter for JSON files and process each one
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} opportunity files to process\n`);
    
    // Array to store all results
    const allResults = [];
    
    jsonFiles.forEach((fileName, index) => {
      // Extract ID from filename (e.g., site_copportunities_1baa230b-d2dd-4ece-8803-4f24949faed0.json)
      const idMatch = fileName.match(/site_copportunities_([a-f0-9-]+)\.json$/);
      
      if (idMatch) {
        const id = idMatch[1];
        const domain = idToDomainMap[id];
        
        if (domain) {
          const filePath = path.join(opportunitiesDir, fileName);
          
          console.log(`\n${'='.repeat(80)}`);
          console.log(`Processing file ${index + 1}/${jsonFiles.length}: ${fileName}`);
          console.log(`ID: ${id}`);
          console.log(`Domain: ${domain}`);
          console.log(`${'='.repeat(80)}\n`);
          
          // Call the main function with the domain, file path, and site ID
          const result = extractAndAnalyzeLinks(domain, filePath, id);
          allResults.push(result);
          
        } else {
          console.log(`\n⚠️  No domain found for ID: ${id} in file: ${fileName}`);
        }
      } else {
        console.log(`\n⚠️  Could not extract ID from filename: ${fileName}`);
      }
    });
    
    // Write consolidated results as a simple array of objects
    const consolidatedFilename = `extracted-links-consolidated_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
    const consolidatedOutputPath = path.join(__dirname, 'output', consolidatedFilename);
    
    // Write as a simple array of objects
    fs.writeFileSync(consolidatedOutputPath, JSON.stringify(allResults, null, 2));
    
    // Calculate summary statistics for console output
    const domainsProcessed = [...new Set(allResults.map(r => r.domain))];
    const totalLinksFound = allResults.reduce((sum, r) => sum + (r.statistics?.totalUniqueValues || 0), 0);
    const totalFilteredLinks = allResults.reduce((sum, r) => sum + (r.statistics?.filteredValues || 0), 0);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('All opportunity files processed!');
    console.log(`📄 Consolidated results saved to: ${consolidatedFilename}`);
    console.log(`📊 Summary:`);
    console.log(`   - Files processed: ${allResults.length}`);
    console.log(`   - Domains: ${domainsProcessed.join(', ')}`);
    console.log(`   - Total unique links: ${totalLinksFound}`);
    console.log(`   - Total filtered links: ${totalFilteredLinks}`);
    console.log(`${'='.repeat(80)}`);
    
  } catch (error) {
    console.error('Error processing opportunity files:', error.message);
    process.exit(1);
  }
}

// Execute the main processing function
processAllOpportunityFiles();
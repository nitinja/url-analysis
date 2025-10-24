/**
 * Script to convert opportunities JSON data into a presentable CSV spreadsheet
 * 
 * This script reads opportunity files and creates a structured CSV with:
 * - One row per URL
 * - Columns: Site, Opportunity Type, URL, Priority
 * - Easy to filter and analyze in Excel/Google Sheets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define priority levels for each opportunity type
const OPPORTUNITY_PRIORITIES = {
  'broken-backlinks': 'High',
  'broken-internal-links': 'High',
  'cwv': 'High',
  'sitemap': 'Medium',
  'high-page-views-low-form-views': 'Medium',
  'alt-text': 'Low',
  'meta-tags': 'Low'
};

// Helper function to format opportunity type names for display
function formatOpportunityType(type) {
  const typeNames = {
    'sitemap': 'Missing from Sitemap',
    'high-page-views-low-form-views': 'High Page Views, Low Form Views',
    'alt-text': 'Missing Alt Text',
    'cwv': 'Core Web Vitals Issues',
    'meta-tags': 'Meta Tags Issues',
    'broken-internal-links': 'Broken Internal Links',
    'broken-backlinks': 'Broken Backlinks'
  };
  return typeNames[type] || type;
}

// Extract site name from filename
function getSiteName(filename) {
  // Extract domain from filename like "astrazeneca.com_uuid_opportunities.json"
  const match = filename.match(/^([^_]+)_/);
  return match ? match[1] : 'Unknown';
}

// Process a single opportunities file
function processOpportunitiesFile(filePath) {
  const filename = path.basename(filePath);
  const siteName = getSiteName(filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const rows = [];
  
  // Process each opportunity type
  const opportunityTypes = [
    'broken-backlinks',
    'broken-internal-links', 
    'cwv',
    'sitemap',
    'high-page-views-low-form-views',
    'alt-text',
    'meta-tags'
  ];
  
  opportunityTypes.forEach(type => {
    if (data[type] && Array.isArray(data[type])) {
      data[type].forEach(url => {
        rows.push({
          site: siteName,
          opportunityType: formatOpportunityType(type),
          url: url,
          priority: OPPORTUNITY_PRIORITIES[type] || 'Medium',
          fullUrl: url.startsWith('http') ? url : `https://${url}`
        });
      });
    }
  });
  
  return rows;
}

// Convert rows to CSV format
function rowsToCSV(rows) {
  // CSV headers
  const headers = ['Site', 'Opportunity Type', 'Priority', 'URL', 'Full URL'];
  const csvLines = [headers.join(',')];
  
  // Add data rows
  rows.forEach(row => {
    const csvRow = [
      `"${row.site}"`,
      `"${row.opportunityType}"`,
      `"${row.priority}"`,
      `"${row.url}"`,
      `"${row.fullUrl}"`
    ];
    csvLines.push(csvRow.join(','));
  });
  
  return csvLines.join('\n');
}

// Create summary statistics
function createSummary(allRows) {
  const summary = {
    totalUrls: allRows.length,
    bySite: {},
    byOpportunityType: {},
    byPriority: {}
  };
  
  allRows.forEach(row => {
    // Count by site
    summary.bySite[row.site] = (summary.bySite[row.site] || 0) + 1;
    
    // Count by opportunity type
    summary.byOpportunityType[row.opportunityType] = 
      (summary.byOpportunityType[row.opportunityType] || 0) + 1;
    
    // Count by priority
    summary.byPriority[row.priority] = 
      (summary.byPriority[row.priority] || 0) + 1;
  });
  
  return summary;
}

// Main execution
function main() {
  console.log('Creating opportunities spreadsheet...\n');
  
  // Define the directory containing opportunity files
  const opportunitiesDir = path.join(__dirname, 'output', 'opportunities-links');
  
  // Check if directory exists
  if (!fs.existsSync(opportunitiesDir)) {
    console.error(`Error: Directory not found: ${opportunitiesDir}`);
    process.exit(1);
  }
  
  // Get all JSON files
  const files = fs.readdirSync(opportunitiesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(opportunitiesDir, file));
  
  console.log(`Found ${files.length} opportunity files`);
  
  // Process all files
  let allRows = [];
  files.forEach(file => {
    const rows = processOpportunitiesFile(file);
    allRows = allRows.concat(rows);
    console.log(`  ✓ Processed ${path.basename(file)}: ${rows.length} opportunities`);
  });
  
  // Sort by priority (High -> Medium -> Low) and then by site
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  allRows.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.site.localeCompare(b.site);
  });
  
  // Generate CSV
  const csv = rowsToCSV(allRows);
  
  // Write to file
  const outputPath = path.join(__dirname, 'output', 'opportunities-spreadsheet.csv');
  fs.writeFileSync(outputPath, csv, 'utf8');
  
  // Create summary
  const summary = createSummary(allRows);
  const summaryPath = path.join(__dirname, 'output', 'opportunities-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  
  // Print summary
  console.log('\n✅ Spreadsheet created successfully!\n');
  console.log('Summary Statistics:');
  console.log(`  Total opportunities: ${summary.totalUrls}`);
  console.log('\n  By Priority:');
  Object.entries(summary.byPriority)
    .sort((a, b) => priorityOrder[a[0]] - priorityOrder[b[0]])
    .forEach(([priority, count]) => {
      console.log(`    ${priority}: ${count}`);
    });
  console.log('\n  By Opportunity Type:');
  Object.entries(summary.byOpportunityType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });
  console.log('\n  By Site:');
  Object.entries(summary.bySite)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([site, count]) => {
      console.log(`    ${site}: ${count}`);
    });
  
  console.log(`\n📊 Output files:`);
  console.log(`  CSV: ${outputPath}`);
  console.log(`  Summary: ${summaryPath}`);
}

// Run the script
main();


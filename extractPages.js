import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively extracts all "page" values from a nested object/array structure
 * @param {any} data - The data structure to search through
 * @param {Set<string>} pages - Set to store unique page URLs
 */
function extractPagesRecursively(data, pages) {
  const _data = data[0];
  console.log(data);
  for (const key in data) {
    if (key === "page") {
      pages.add(data[key]);
    }
  }
}

/**
 * Main function to extract all page values from the JSON file
 */
async function extractAllPages() {
  try {
    console.log("📖 Reading JSON file...");
    
    // Read the JSON file
    const jsonFilePath = path.join(__dirname, "output", "site_ids_2025-09-30.json");
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");
    
    console.log("🔄 Parsing JSON data...");
    const data = JSON.parse(jsonData);
    
    console.log("🔍 Extracting page values...");
    const pages = new Set(); // Use Set to automatically handle duplicates
    
    // Extract all page values recursively
    extractPagesRecursively(data, pages);
    
    // Convert Set to Array for easier handling
    const uniquePages = Array.from(pages).sort();
    
    console.log(`✅ Found ${uniquePages.length} unique pages`);
    
    // // Create output directory if it doesn't exist
    // const outputDir = path.join(__dirname, "output");
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir, { recursive: true });
    // }
    
    // // Write extracted pages to a new JSON file
    // const outputFilePath = path.join(outputDir, "extracted_pages.json");
    // fs.writeFileSync(outputFilePath, JSON.stringify(uniquePages, null, 2));
    
    // console.log(`📝 Extracted pages written to: ${outputFilePath}`);
    
    // // Also create a simple text file with one page per line
    // const textFilePath = path.join(outputDir, "extracted_pages.txt");
    // fs.writeFileSync(textFilePath, uniquePages.join("\n"));
    
    // console.log(`📄 Pages list written to: ${textFilePath}`);
    
    // // Display first 10 pages as preview
    // console.log("\n📋 Preview of first 10 pages:");
    // uniquePages.slice(0, 10).forEach((page, index) => {
    //   console.log(`${index + 1}. ${page}`);
    // });
    
    // if (uniquePages.length > 10) {
    //   console.log(`... and ${uniquePages.length - 10} more pages`);
    // }
    
    return uniquePages;
    
  } catch (error) {
    console.error("❌ Error extracting pages:", error);
    throw error;
  }
}

// Execute the extraction
extractAllPages()
  .then(pages => {
    console.log(`\n🎉 Successfully extracted ${pages.length} unique pages!`);
  })
  .catch(error => {
    console.error("💥 Failed to extract pages:", error);
    process.exit(1);
  });

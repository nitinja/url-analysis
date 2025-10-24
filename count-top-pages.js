/**
 * Script to count topPages for each object in ahrefs-top-200-pages.json
 * This script reads the JSON file and outputs the count of topPages for each site.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function countTopPages() {
  try {
    // Read the ahrefs-top-200-pages.json file
    const filePath = path.join(__dirname, "output", "ahrefs-top-200-pages.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    console.log("=== Top Pages Count for Each Site ===\n");

    // Initialize counters
    let totalSites = 0;
    let totalPages = 0;
    let minPages = Infinity;
    let maxPages = 0;

    // Process each site object
    data.forEach((site, index) => {
      const siteId = site.siteId;
      const siteBaseURL = site.siteBaseURL.trim(); // Remove extra whitespace
      const topPagesCount = site.topPages ? site.topPages.length : 0;

      // Update counters
      totalSites++;
      totalPages += topPagesCount;
      minPages = Math.min(minPages, topPagesCount);
      maxPages = Math.max(maxPages, topPagesCount);

      // Display the count for this site
      console.log(`Site #${index + 1}:`);
      console.log(`  Site ID: ${siteId}`);
      console.log(`  Base URL: ${siteBaseURL}`);
      console.log(`  Top Pages Count: ${topPagesCount}`);
      console.log("");
    });

    // Display summary statistics
    console.log("=== Summary Statistics ===");
    console.log(`Total Sites: ${totalSites}`);
    console.log(`Total Pages: ${totalPages}`);
    console.log(`Average Pages per Site: ${(totalPages / totalSites).toFixed(2)}`);
    console.log(`Minimum Pages: ${minPages}`);
    console.log(`Maximum Pages: ${maxPages}`);

    // Create a summary object for potential file output
    const summary = {
      totalSites,
      totalPages,
      averagePagesPerSite: parseFloat((totalPages / totalSites).toFixed(2)),
      minPages,
      maxPages,
      siteDetails: data.map((site, index) => ({
        siteNumber: index + 1,
        siteId: site.siteId,
        siteBaseURL: site.siteBaseURL.trim(),
        topPagesCount: site.topPages ? site.topPages.length : 0
      }))
    };

    // Write summary to a JSON file
    const summaryPath = path.join(__dirname, "output", "top-pages-count-summary.json");
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
    console.log(`\nSummary written to: ${summaryPath}`);

  } catch (error) {
    console.error("Error reading or processing the file:", error);
  }
}

// Run the function
countTopPages();


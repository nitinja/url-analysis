/**
 * Script to count objects and topPages for each object in site_ids_2025-10-07.json
 * This script reads the JSON file and outputs the count of objects and topPages for each site.
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function countSiteIds() {
  try {
    // Read the site_ids_2025-10-07.json file
    const filePath = path.join(__dirname, "output", "site_ids_2025-10-07.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    console.log("=== Site IDs Count Analysis ===\n");

    // Initialize counters
    let totalSites = 0;
    let totalPages = 0;
    let minPages = Infinity;
    let maxPages = 0;
    let sitesWithTopPages = 0;
    let sitesWithoutTopPages = 0;

    // Process each site object
    data.forEach((site, index) => {
      const siteId = site.siteId;
      const siteBaseURL = site.siteBaseURL;
      const topPagesCount = site.topPages ? site.topPages.length : 0;

      // Update counters
      totalSites++;
      totalPages += topPagesCount;
      minPages = Math.min(minPages, topPagesCount);
      maxPages = Math.max(maxPages, topPagesCount);

      if (topPagesCount > 0) {
        sitesWithTopPages++;
      } else {
        sitesWithoutTopPages++;
      }

      // Display the count for this site (only show first 10 and last 10 for brevity)
      if (index < 10 || index >= data.length - 10) {
        console.log(`Site #${index + 1}:`);
        console.log(`  Site ID: ${siteId}`);
        console.log(`  Base URL: ${siteBaseURL}`);
        console.log(`  Top Pages Count: ${topPagesCount}`);
        console.log("");
      } else if (index === 10) {
        console.log("... (showing first 10 and last 10 sites only) ...\n");
      }
    });

    // Display summary statistics
    console.log("=== Summary Statistics ===");
    console.log(`Total Sites: ${totalSites}`);
    console.log(`Total Pages: ${totalPages}`);
    console.log(`Average Pages per Site: ${(totalPages / totalSites).toFixed(2)}`);
    console.log(`Minimum Pages: ${minPages}`);
    console.log(`Maximum Pages: ${maxPages}`);
    console.log(`Sites with Top Pages: ${sitesWithTopPages}`);
    console.log(`Sites without Top Pages: ${sitesWithoutTopPages}`);

    // Create a summary object for potential file output
    const summary = {
      totalSites,
      totalPages,
      averagePagesPerSite: parseFloat((totalPages / totalSites).toFixed(2)),
      minPages,
      maxPages,
      sitesWithTopPages,
      sitesWithoutTopPages,
      siteDetails: data.map((site, index) => ({
        siteNumber: index + 1,
        siteId: site.siteId,
        siteBaseURL: site.siteBaseURL,
        topPagesCount: site.topPages ? site.topPages.length : 0
      }))
    };

    // Write summary to a JSON file
    const summaryPath = path.join(__dirname, "output", "site-ids-count-summary.json");
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
    console.log(`\nSummary written to: ${summaryPath}`);

  } catch (error) {
    console.error("Error reading or processing the file:", error);
  }
}

// Run the function
countSiteIds();


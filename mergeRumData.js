// Script to merge rum-data-list.json and rum-data-list-missing.json
// This script intelligently merges the two files, prioritizing non-empty data

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to merge RUM data files
function mergeRumDataFiles() {
  console.log("🔄 Starting merge of RUM data files...\n");

  // Read both JSON files
  const rumDataListPath = path.join(__dirname, "output", "rum-data-list.json");
  const rumDataMissingPath = path.join(__dirname, "output", "rum-data-list-missing.json");

  const rumDataList = JSON.parse(fs.readFileSync(rumDataListPath, "utf8"));
  const rumDataMissing = JSON.parse(fs.readFileSync(rumDataMissingPath, "utf8"));

  console.log(`📊 Original rum-data-list.json: ${rumDataList.length} sites`);
  console.log(`📊 Missing rum-data-list-missing.json: ${rumDataMissing.length} sites\n`);

  // Create a map of existing data using siteBaseURL as key
  const siteMap = new Map();

  // Add all sites from the original list to the map
  rumDataList.forEach((site) => {
    siteMap.set(site.siteBaseURL, site);
  });

  console.log("🔍 Processing missing data...\n");

  let updatedCount = 0;
  let newCount = 0;

  // Process missing data
  rumDataMissing.forEach((missingSite) => {
    const existingSite = siteMap.get(missingSite.siteBaseURL);

    if (existingSite) {
      // Site exists - merge data intelligently
      // Prioritize non-empty topPages arrays
      if (
        missingSite.topPages &&
        missingSite.topPages.length > 0 &&
        (!existingSite.topPages || existingSite.topPages.length === 0)
      ) {
        console.log(
          `  ✅ Updating ${missingSite.siteBaseURL}: Adding ${missingSite.topPages.length} top pages`
        );
        existingSite.topPages = missingSite.topPages;
        updatedCount++;
      }

      // Update siteId if missing site has one and existing doesn't
      if (
        missingSite.siteId &&
        missingSite.siteId !== "" &&
        (!existingSite.siteId || existingSite.siteId === "")
      ) {
        console.log(`  ✅ Updating ${missingSite.siteBaseURL}: Adding siteId`);
        existingSite.siteId = missingSite.siteId;
        updatedCount++;
      }
    } else {
      // Site doesn't exist - add it
      console.log(`  ➕ Adding new site: ${missingSite.siteBaseURL}`);
      siteMap.set(missingSite.siteBaseURL, missingSite);
      newCount++;
    }
  });

  // Convert map back to array
  const mergedData = Array.from(siteMap.values());

  // Sort by siteBaseURL for consistent ordering
  mergedData.sort((a, b) => a.siteBaseURL.localeCompare(b.siteBaseURL));

  // Write merged data to new file
  const outputPath = path.join(__dirname, "output", "rum-data-list-final.json");
  fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("✅ Merge completed successfully!");
  console.log("=".repeat(60));
  console.log(`📊 Final merged file: ${mergedData.length} sites`);
  console.log(`   - Updated sites: ${updatedCount}`);
  console.log(`   - New sites added: ${newCount}`);
  console.log(`\n📁 Output saved to: ${outputPath}`);

  // Print statistics about empty top pages
  const sitesWithEmptyPages = mergedData.filter(
    (site) => !site.topPages || site.topPages.length === 0
  );
  const sitesWithData = mergedData.filter(
    (site) => site.topPages && site.topPages.length > 0
  );

  console.log("\n📈 Statistics:");
  console.log(`   - Sites with top pages data: ${sitesWithData.length}`);
  console.log(`   - Sites with empty top pages: ${sitesWithEmptyPages.length}`);

  if (sitesWithEmptyPages.length > 0) {
    console.log("\n⚠️  Sites still missing top pages data:");
    sitesWithEmptyPages.forEach((site) => {
      console.log(`   - ${site.siteBaseURL}`);
    });
  }

  return mergedData;
}

// Run the merge
try {
  mergeRumDataFiles();
} catch (error) {
  console.error("❌ Error during merge:", error.message);
  throw error;
}


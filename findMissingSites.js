// Script to find which customer sites are missing from RUM data list final
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findMissingSites() {
  console.log("🔍 Comparing customer sites with RUM data list...\n");

  // Read both JSON files
  const customerSitesPath = path.join(__dirname, "output", "customer-sites-ids.json");
  const rumDataFinalPath = path.join(__dirname, "output", "rum-data-list-final.json");

  const customerSites = JSON.parse(fs.readFileSync(customerSitesPath, "utf8"));
  const rumDataFinal = JSON.parse(fs.readFileSync(rumDataFinalPath, "utf8"));

  console.log(`📊 Customer sites: ${customerSites.length} sites`);
  console.log(`📊 RUM data final: ${rumDataFinal.length} sites\n`);

  // Create a Set of base URLs from RUM data for quick lookup
  // We need to normalize URLs (remove www. prefix) for proper comparison
  const rumSiteUrls = new Set();
  
  rumDataFinal.forEach((site) => {
    // Store both with and without www. prefix for comparison
    rumSiteUrls.add(site.siteBaseURL);
    rumSiteUrls.add(site.siteBaseURL.replace("www.", ""));
    rumSiteUrls.add("www." + site.siteBaseURL.replace("www.", ""));
  });

  // Find missing sites
  const missingSites = [];
  const foundSites = [];

  customerSites.forEach((customerSite) => {
    const baseURL = customerSite.baseURL;
    const normalizedURL = baseURL.replace("www.", "");
    
    // Check if site exists in RUM data (with or without www.)
    const isFound = rumSiteUrls.has(baseURL) || 
                    rumSiteUrls.has(normalizedURL) || 
                    rumSiteUrls.has("www." + normalizedURL);
    
    if (isFound) {
      foundSites.push(customerSite);
    } else {
      missingSites.push(customerSite);
    }
  });

  // Display results
  console.log("=".repeat(70));
  console.log("📈 COMPARISON RESULTS");
  console.log("=".repeat(70));
  console.log(`✅ Sites found in RUM data: ${foundSites.length}`);
  console.log(`❌ Sites missing from RUM data: ${missingSites.length}\n`);

  if (missingSites.length > 0) {
    console.log("⚠️  MISSING SITES (not in rum-data-list-final.json):");
    console.log("-".repeat(70));
    missingSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.baseURL}`);
      console.log(`   Site ID: ${site.id}`);
    });
  }

  if (foundSites.length > 0) {
    console.log("\n✅ FOUND SITES (present in rum-data-list-final.json):");
    console.log("-".repeat(70));
    foundSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.baseURL}`);
    });
  }

  // Save missing sites to a file for reference
  if (missingSites.length > 0) {
    const outputPath = path.join(__dirname, "output", "missing-sites-from-rum.json");
    fs.writeFileSync(outputPath, JSON.stringify(missingSites, null, 2));
    console.log(`\n📁 Missing sites saved to: ${outputPath}`);
  }

  return { missingSites, foundSites };
}

// Run the comparison
try {
  findMissingSites();
} catch (error) {
  console.error("❌ Error during comparison:", error.message);
  throw error;
}


const fs = await import("fs");
const path = await import("path");
import { fetchWithOptions, writeToFile, fetchUrlsList } from "./utils.js";

const customerUrls = `
  https://qualcomm.com
  `;

// Function to read and display customer site names and IDs
async function getCustomerSitesData() {
  try {
    // Import fs module for file operations

    // Read the customer sites JSON file
    const filePath = path.join(
      process.cwd(),
      "output",
      "customer-sites-ids.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    const customerSites = JSON.parse(fileContent);

    console.log("=== Customer Sites Data ===\n");
    console.log(`Total sites found: ${customerSites.length}\n`);

    // Print each site with formatted output
    customerSites.forEach((site, index) => {
      console.log(`Site: ${site.baseURL}, ID: ${site.id}`);
    });

    return customerSites;
  } catch (error) {
    console.error("Error reading customer sites data:", error.message);
    throw error;
  }
}

// Main function to process all customer URLs and fetch site IDs
async function getCustomerAuditData() {
  // Call the function to print customer sites data
  const customerSites = (await getCustomerSitesData());

  for (const site of customerSites) {
    const opportunities = await fetchWithOptions(
      `sites/${site.id}/opportunities/`,
      (response) => {
        return response.map((opportunity) => opportunity);
      }
    );

    for (const opportunity of opportunities) {
      const suggestions = await fetchWithOptions(
        `sites/${site.id}/opportunities/${opportunity.id}/suggestions/`, (response) => {
          return response.map((suggestion) => suggestion.data);
        }
      );
      console.log(suggestions);
      opportunity.suggestions = suggestions;
    }

    writeToFile(opportunities, `site_copportunities_${site.id}.json`);

    console.log(opportunities);
  }

  // // Parse customer URLs into array
  // const customerUrlsArray = customerUrls
  //   .split("\n")
  //   .filter((url) => url.trim() !== "");

  // console.log(`Processing ${customerUrlsArray.length} customer URLs...`);

  // const sunstar_site_id = "542ad116-ed33-448a-a123-06cbcd7c1d4c"
  // const apiUrlPaths = customerUrlsArray.map(url => `sites/${sunstar_site_id}/audits/experimentation-opportunities`);

  // const returnData = await fetchUrlsList(apiUrlPaths, (response) => {
  //   return response;
  // });

  // console.log(returnData);

  // // Write all collected objects to JSON file
  // writeToFile(returnData);

  // return returnData;
}

await getCustomerAuditData().catch(console.error);

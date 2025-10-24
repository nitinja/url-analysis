import fs from "fs";
import path from "path";
import { fetchWithOptions, writeToFile, fetchUrlsList } from "./utils.js";
import RUMAPIClient from "@adobe/spacecat-shared-rum-api-client";
// Import site RUM keys from JSON file
// const siteRumKeysJson = fs.readFileSync("./output/site-rum-keys-missing.json", "utf8");
// const siteRumKeys = JSON.parse(siteRumKeysJson);

const siteIdObjectsJson = fs.readFileSync(
  "./output/customer-sites-ids.json",
  "utf8"
);
const siteIdObjects = JSON.parse(siteIdObjectsJson);

const customerUrls = `
  https://qualcomm.com
  https://breville.com
  https://crucial.com
  https://micron.com
  https://t-mobile.com
  https://auspost.com.au
  https://abbvie.com
  https://continental-tires.com
  https://berkshirepartners.com
  https://astrazeneca.com
  https://humana.com
  https://celestyal.com
  https://jet2.com
  https://adobe.com
  https://bamboohr.com
  https://volvotrucks.us
  https://sunstar.com
  https://wilson.com
  https://hersheyland.com
  https://chocolateworld.com
  https://westJet.com
  `;

// Main function to process all customer URLs and fetch site IDs
async function processCustomerUrls() {
  // Parse customer URLs into array
  const customerUrlsArray = customerUrls
    .split("\n")
    .filter((url) => url.trim() !== "");

  console.log(`Processing ${customerUrlsArray.length} customer URLs...`);

  const apiUrlPaths = customerUrlsArray.map(
    (url) => `sites/by-base-url/${btoa(url)}`
  );

  const siteIdObjects = await fetchUrlsList(apiUrlPaths, (response) => {
    return { baseURL: response.baseURL, id: response.id };
  });

  // Write all collected objects to JSON file
  writeToFile(siteIdObjects);

  return siteIdObjects;
}

async function getAhrefsData() {
  const siteIdObjectsJson = fs.readFileSync(
    "output/customer-sites-ids.json",
    "utf8"
  );
  const siteIdObjectsArray = JSON.parse(siteIdObjectsJson);
  console.log(siteIdObjectsJson, JSON.parse(siteIdObjectsJson)[0].id);

  const callPromises = siteIdObjectsArray.map(async (siteIdObject) => {
    const topPagesApiUrl = `sites/${siteIdObject.id}/top-pages/ahrefs/global`;
    return fetchWithOptions(topPagesApiUrl);
  });

  const topPagesResponses = await Promise.all(callPromises).catch((error) => {
    console.error("❌ Error fetching top pages:", error);
  });

  const topPages = topPagesResponses.map((response, index) => {
    return {
      siteBaseURL: siteIdObjectsArray[index].baseURL,
      siteId: siteIdObjectsArray[index].id,
      topPages: response.map((page) => page.url),
    };
  });

  writeToFile(topPages);
  //processCustomerUrls();

  // const topPages = await Promise.all(callPromises);
  // for (const siteIdObject of siteIdObjectsArray) {
  //   const topPagesApiUrl = `sites/${siteIdObject.id}/top-pages`;
  //   const topPages = await fetchWithOptions(topPagesApiUrl);
  //   console.log(topPages.map((page) => page.url));
  // }
  // const topPagesApiUrl = `sites/${siteIdObjectsArray[0].id}/top-pages`;
  // const topPages = await fetchWithOptions(topPagesApiUrl);
  // console.log(topPages.map((page) => page.url));
}

export async function getRUMData({ Domain, RUM_Domain_Key_or_Result }) {
  console.log("Getting RUM Data");

  // 1. Create RUM API client
  const rumAPIClient = new RUMAPIClient({}, console);

  // 2. Prepare query options
  const options = {
    domain: Domain,
    domainkey: RUM_Domain_Key_or_Result,
    interval: 30,
    granularity: "daily",
  };

  // 3. Query for high traffic pages
  const result = await rumAPIClient.query("traffic-acquisition", options);

  let topPages = result.map((page) => ({ url: page.url, traffic: page.total }));
  // Sort the topPages array in descending order based on the 'traffic' property
  // This ensures that pages with the highest traffic appear first in the array
  topPages.sort((a, b) => b.traffic - a.traffic);
  topPages = topPages.slice(0, 200).map((page) => page.url);

const site = siteIdObjects.find((site) => site.baseURL === Domain);
  return {
    siteBaseURL: Domain,
    siteId: site? site.id : "",
    topPages: topPages,
  };
}

async function getRUMDataForAllSites() {
  const rumDataList = [];
  for (const site of siteRumKeys) {
    console.log(site.RUM_Domain_Key_or_Result);
    if (site.RUM_Domain_Key_or_Result !== "") {
      try {
        const rumData = await getRUMData(site);
        rumDataList.push(rumData);
      } catch (error) {
        console.error(`Error fetching RUM data for ${site.Domain}:`, error);
        const site = siteIdObjects.find((site) => site.baseURL === Domain);
  
        rumDataList.push({
          siteBaseURL: Domain,
          siteId: site? site.id : "",
          topPages: topPages,
        });
      }
    } else {
      const site = siteIdObjects.find((site) => site.baseURL === Domain);
  
      rumDataList.push({
        siteBaseURL: Domain,
        siteId: site? site.id : "",
        topPages: topPages,
      });
    }
  }

  // Write the file after all data is collected
  writeToFile(rumDataList, "rum-data-list-missing.json");
}

// Await the async function call
// getRUMDataForAllSites().catch(console.error);

// getRUMData();

getAhrefsData();

// get customer audits data

// read these files: output/ahrefs-top-200-pages.json, output/rum-top-200-pages.json, output/all-opportunities-top-pages.json, output/customer-sites-ids.json

/**
 * Reads and parses the top pages data from the four JSON files:
 *   - output/ahrefs-top-200-pages.json
 *   - output/rum-top-200-pages.json
 *   - output/all-opportunities-top-pages.json
 *   - output/customer-sites-ids.json
 *
 * This function returns an object containing the parsed data from each file.
 * It uses Node.js 'fs' and 'path' modules to read files asynchronously.
 *
 * Note: This function assumes the files exist and are valid JSON.
 */
// Use ES6 import syntax for importing modules
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchWithOptions, writeToFile, fetchUrlsList } from "./utils.js";

/**
 * Reads and parses the four JSON files.
 * @returns {Promise<{ahrefsData: any, rumData: any, opportunitiesData: any, customerSitesData: any}>} Parsed data from each file.
 */
async function readDataFiles() {
  // Define the file paths relative to the current file
  // __dirname is not defined in ES modules by default.
  // To get the current directory, use import.meta.url with fileURLToPath.
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const ahrefsFile = path.join(
    __dirname,
    "output",
    "ahrefs-top-200-pages.json"
  );
  const rumFile = path.join(__dirname, "output", "rum-top-200-pages.json");
  const opportunitiesFile = path.join(
    __dirname,
    "output",
    "all-opportunities-top-pages.json"
  );
  const customerSitesFile = path.join(
    __dirname,
    "output",
    "customer-sites-ids.json"
  );

  try {
    // Read all files in parallel for efficiency
    const [ahrefsRaw, rumRaw, opportunitiesRaw, customerSitesRaw] =
      await Promise.all([
        fs.readFile(ahrefsFile, "utf-8"),
        fs.readFile(rumFile, "utf-8"),
        fs.readFile(opportunitiesFile, "utf-8"),
        fs.readFile(customerSitesFile, "utf-8"),
      ]);

    // Parse the JSON content of each file
    const ahrefsData = JSON.parse(ahrefsRaw);
    const rumData = JSON.parse(rumRaw);
    const opportunitiesData = JSON.parse(opportunitiesRaw);
    const customerSitesData = JSON.parse(customerSitesRaw);

    // Return an object containing all parsed data
    return { ahrefsData, rumData, opportunitiesData, customerSitesData };
  } catch (error) {
    // Log and rethrow the error for the caller to handle
    console.error("Error reading or parsing top pages files:", error);
    throw error;
  }
}

function findOverlap(ahrefsData, rumData, opportunitiesData, baseURL, id) {
  // should return
  // 1. overlapped pages between ahrefsData, rumData, and opportunitiesData
  // 2. overlapped pages between ahrefsData, and opportunitiesData
  // 3. overlapped pages between rumData, and opportunitiesData

  const ahrefsPages = ahrefsData.find((data) => data.siteId === id).topPages;
  const rumPages = rumData.find((data) => data.siteId === id).topPages;
  const opportunitiesPages = opportunitiesData.find(
    (data) => data.siteId === id
  ).extractedLinks;

  // console.log(`ahrefsPages:`, ahrefsPages);
  // console.log(`rumPages:`, rumPages);
  // console.log(`opportunitiesPages:`, opportunitiesPages);

  // This function finds overlapping pages between three data sources:
  // ahrefsData, rumData, and opportunitiesData for a given site (by id).
  // It returns an object with three arrays:
  // 1. overlapAll: pages present in all three sources
  // 2. overlapAhrefsOpportunities: pages present in both ahrefsData and opportunitiesData
  // 3. overlapRumOpportunities: pages present in both rumData and opportunitiesData

  // Convert all page arrays to Sets for efficient lookup and intersection
  const ahrefsSet = new Set(ahrefsPages);
  const rumSet = new Set(rumPages);
  const opportunitiesSet = new Set(opportunitiesPages);

  // Helper function to find intersection of two sets
  function intersection(setA, setB) {
    return [...setA].filter((x) => setB.has(x));
  }

  // Helper function to find intersection of three sets
  function intersectionThree(setA, setB, setC) {
    return [...setA].filter((x) => setB.has(x) && setC.has(x));
  }

  // Find pages present in all three sources
  const overlapAll = intersectionThree(ahrefsSet, rumSet, opportunitiesSet);

  // Find pages present in both ahrefsData and opportunitiesData
  const overlapAhrefsOpportunities = intersection(ahrefsSet, opportunitiesSet);

  // Find pages present in both rumData and opportunitiesData
  const overlapRumOpportunities = intersection(rumSet, opportunitiesSet);

  // Return the results as an object with descriptive keys
  return {
    overlapAll,
    overlapAhrefsOpportunities,
    overlapRumOpportunities,
  };
}

//a function that takes a string and returns a string
async function main() {
  //read all data files
  try {
    const { ahrefsData, rumData, opportunitiesData, customerSitesData } =
      await readDataFiles();
    //console.log(ahrefsData);
    // Loop through all objects in customerSitesData and print each one
    // This will help verify the structure and contents of the customerSitesData array

    const statsList = [];
    customerSitesData.forEach(({ baseURL, id }, idx) => {
      // Print the index and the site object in a readable format
      //console.log(`Customer Site #${idx + 1}:`, JSON.stringify({baseURL, id}, null, 2));

      const overlap = findOverlap(
        ahrefsData,
        rumData,
        opportunitiesData,
        baseURL,
        id
      );
      //console.log(`Overlap:`, JSON.stringify(overlap, null, 2));

      const stats = {
        siteId: id,
        siteBaseURL: baseURL,
        overlapAll: overlap.overlapAll.length,
        overLapAllPercentage: parseFloat(((overlap.overlapAll.length / 200) * 100).toFixed(2)),
        overlapAhrefsOpportunities: overlap.overlapAhrefsOpportunities.length,
        overlapAhrefsOpportunitiesPercentage:
          parseFloat(((overlap.overlapAhrefsOpportunities.length / 200) * 100).toFixed(2)),
        overlapRumOpportunities: overlap.overlapRumOpportunities.length,
        overlapRumOpportunitiesPercentage:
          parseFloat(((overlap.overlapRumOpportunities.length / 200) * 100).toFixed(2)),
      };
      console.log(`Stats:`, JSON.stringify(stats, null, 2));

      statsList.push(stats);
    });
    writeToFile(statsList, "stats.json");

    // Write the stats to a CSV file as well

    
    // Convert the statsList to CSV format
    const csvString = convertToCSV(statsList);
    
    // Write the CSV string to a file named "stats.csv"
    // The writeToFile function expects data and filename
    // We assume writeToFile can handle string data for CSV
    // Write the CSV string to a file named "stats.csv" using Node.js fs/promises
    // We use 'utf-8' encoding to ensure the file is written as text
    fs.writeFile("stats.csv", csvString, "utf-8")
    .then(() => {
      console.log("stats.csv has been written successfully.");
    })
    .catch((err) => {
      console.error("Error writing stats.csv:", err);
    });
  } catch (error) {
    // Handle any errors that occur during file reading/parsing
    console.error("Failed to read top pages files:", error);
  }
  
  // Log the results for debugging
  console.log(`Analysis complete:`);
}

main()
.then((result) => {
  console.log("==== Done ====");
})
.catch((error) => {
  console.error("Error:", error);
});

// Helper function to convert an array of objects to CSV string
function convertToCSV(arr) {
  if (!arr.length) return "";
  // Get the headers from the keys of the first object
  const headers = Object.keys(arr[0]);
  // Map each object to a CSV row
  const rows = arr.map((obj) =>
    headers
      .map((header) => {
        // Escape double quotes by doubling them
        const value = obj[header];
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );
  // Join headers and rows with newlines
  return [headers.join(","), ...rows].join("\n");
}
const fs = require("fs");
const path = require("path");
// Target keys to search for
const targetKeys = ["pageUrl", "urlFrom", "url", "url_from", "page"];
// Path to the directory containing the files
// const dirPath = path.join(__dirname, "output", "opportunities-cleaned");

const processUrls = (urls, domain) => {
  // Filter unique values that contain the domain
  const filteredValues = urls.filter((value) => {
    // Convert value to string and check if it contains the domain (case-insensitive)
    const valueStr = String(value).toLowerCase();
    return valueStr.includes(domain.toLowerCase());
  });

  // Process filtered values to remove HTTP/HTTPS prefixes
  const processedFilteredValues = filteredValues.map((value) => {
    let processedValue = String(value);

    // Remove https:// prefix
    if (processedValue.toLowerCase().startsWith("https://")) {
      processedValue = processedValue.substring(8);
    }

    // Remove http:// prefix
    if (processedValue.toLowerCase().startsWith("http://")) {
      processedValue = processedValue.substring(7);
    }

    // Remove www. prefix if present at the beginning of the value (case-insensitive)
    // This ensures that links are normalized and do not start with "www."
    if (processedValue.toLowerCase().startsWith("www.")) {
      processedValue = processedValue.substring(4);
    }

    return processedValue;
  });
  const uniqueProcessedFilteredValues = [...new Set(processedFilteredValues)];
  return uniqueProcessedFilteredValues;
};

/**
 * Clean domain name by removing www, http, https prefixes
 * @param {string} baseURL - The base URL to clean
 * @returns {string} Cleaned domain name
 */
function cleanDomain(baseURL) {
  let domain = baseURL.toLowerCase();

  // Remove www. prefix
  if (domain.startsWith("www.")) {
    domain = domain.substring(4);
  }

  // Remove http:// prefix
  if (domain.startsWith("http://")) {
    domain = domain.substring(7);
  }

  // Remove https:// prefix
  if (domain.startsWith("https://")) {
    domain = domain.substring(8);
  }

  return domain;
}

const customerSitesPath = path.join(
  __dirname,
  "output",
  "customer-sites-ids.json"
);
const customerSitesData = JSON.parse(
  fs.readFileSync(customerSitesPath, "utf8")
);

// Create a mapping of ID to cleaned domain
const idToDomainMap = {};
customerSitesData.forEach((site) => {
  const cleanedDomain = cleanDomain(site.baseURL);
  idToDomainMap[site.id] = cleanedDomain;
});

const opportunitiesDir = path.join(
  __dirname,
  "output",
  "opportunities-cleaned"
);
const files = fs.readdirSync(opportunitiesDir);

// Filter for JSON files and process each one
const jsonFiles = files.filter((file) => file.endsWith(".json"));

jsonFiles.forEach((file) => {
  const filePath = path.join(opportunitiesDir, file);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(fileContent);

  const idMatch = file.match(/site_copportunities_([a-f0-9-]+)\.json$/);

  const id = idMatch[1];
  const domain = idToDomainMap[id];
  /* This is  a file with the opportunities data for a specific customer */
  console.log(`Domain: ${domain}`);
  // Group the items in jsonData by their 'type' key
  const groupedByType = jsonData.reduce((acc, item) => {
    const type = item.type || "undefined";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const result = {};
  // Print all keys at top-level of each item, grouped by 'type'
  for (const [type, items] of Object.entries(groupedByType)) {
    console.log(`Type: ${type}, Items: ${items.length}`);
    result[type] = Array.from(extractValues(items));

    result[type] = processUrls(result[type], domain);
  }

  // Write the JSON of the first item to "op1.json"
  fs.writeFileSync(
    path.join("output", "opportunities-links", `${domain}_${id}_opportunities.json`),
    JSON.stringify(result, null, 2),
    "utf8"
  );
});

/**
 * Recursively traverse an object or array and collect values for specified keys
 * @param {*} obj - The object/array to traverse
 * @param {Set} results - Set to store found values (avoids duplicates)
 * @param {string} currentPath - Current path in the object tree (for debugging)
 * @returns {Set} Set containing all found values with their metadata
 */
function extractValues(obj, results = new Set(), currentPath = "root") {
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
  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = `${currentPath}.${key}`;

      // Check if this key is one of our target keys
      if (targetKeys.includes(key)) {
        // Only add non-null, non-undefined values
        if (value !== null && value !== undefined) {
          // Store the value along with its key and path for context
          results.add(value);
        }
      }

      // Recursively traverse nested objects/arrays
      if (typeof value === "object") {
        extractValues(value, results, newPath);
      }
    }
  }

  return results;
}

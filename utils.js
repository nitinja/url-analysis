// Use ES module import syntax for 'fs' and 'path' instead of CommonJS require
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = "https://spacecat.experiencecloud.live/api/v1/";

const options = {
  method: "GET",
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    origin: "https://245265-essdeveloperui.adobeio-static.net",
    priority: "u=1, i",
    referer: "https://245265-essdeveloperui.adobeio-static.net/",
    "sec-ch-ua":
      '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
    "x-client-type": "sites-optimizer-backoffice",
    Authorization:
      "Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3NTk4MzU2OTgzNDhfMzUzNzBiYjctZjU1Ni00YmU3LTg0ZGItODk0ZDZlOWNkOGZiX3V3MiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJleGNfYXBwIiwidXNlcl9pZCI6IjdFQjQ1ODM1NjU1Nzk5MjgwQTQ5NUM2RkA3ZWViMjBmODYzMWMwY2I3NDk1YzA2LmUiLCJzdGF0ZSI6IntcInNlc3Npb25cIjpcImh0dHBzOi8vaW1zLW5hMS5hZG9iZWxvZ2luLmNvbS9pbXMvc2Vzc2lvbi92MS9ZbU0zT1dVek5tWXRNMlJoTnkwMFlXWmpMV0poWkdVdFpETmhZVEZoWXpBMU4yTmxMUzA0TTBJNE1VVXlRalkxTkRBMk9VSkRNRUUwT1RWR1JUVkFZV1J2WW1VdVkyOXRcIn0iLCJhcyI6Imltcy1uYTEiLCJhYV9pZCI6IjgzQjgxRTJCNjU0MDY5QkMwQTQ5NUZFNUBhZG9iZS5jb20iLCJjdHAiOjAsImZnIjoiWjNGWUVBREpWTE01UURVS0hBUVZLWEFBWFU9PT09PT0iLCJzaWQiOiIxNzU5NTAyMzQ5Njg4X2MzMWI2MTdhLWE0M2EtNGU5Ny1hZDU5LTllZTgyMGI2YjM3Y191ZTEiLCJtb2kiOiIzYzU2NjdkOCIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwiZXhwaXJlc19pbiI6Ijg2NDAwMDAwIiwiY3JlYXRlZF9hdCI6IjE3NTk4MzU2OTgzNDgiLCJzY29wZSI6ImFiLm1hbmFnZSxhY2NvdW50X2NsdXN0ZXIucmVhZCxhZGRpdGlvbmFsX2luZm8sYWRkaXRpb25hbF9pbmZvLmpvYl9mdW5jdGlvbixhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQsYWRkaXRpb25hbF9pbmZvLnJvbGVzLEFkb2JlSUQsYWRvYmVpby5hcHByZWdpc3RyeS5yZWFkLGFkb2JlaW9fYXBpLGFlbS5mcm9udGVuZC5hbGwsYXVkaWVuY2VtYW5hZ2VyX2FwaSxjcmVhdGl2ZV9jbG91ZCxtcHMsb3BlbmlkLG9yZy5yZWFkLHBwcy5yZWFkLHJlYWRfb3JnYW5pemF0aW9ucyxyZWFkX3BjLHJlYWRfcGMuYWNwLHJlYWRfcGMuZG1hX3RhcnRhbixzZXJ2aWNlX3ByaW5jaXBhbHMud3JpdGUsc2Vzc2lvbiJ9.RFxXofcNpPqtLVTz4eemGx6-I3La-07jOfvW_BnElbqg1rCrws1gyxR-7mQ27zNGdupV2JSuY_kEVaVEyZ432eQ00aGqqdaP07vesc0EJ2y3b4Drpz6vnJLQG9VDfmWDNiz1yXK2sQBQoLLx0SZPzDodRMOkNCribLEv2rRK0PxXmvGT_oq80K21SwrLaPsu_PGX3uXZdvTvUAgXVWbAhjZscdm1Pk3U3TsVbql10ZQDcQt1cBkht0A7vvmcmrgChfwwdnaguwgE5WRP9c-ym5DkMpMnXIs1mSLUz3yWSokysuLF9-UK4bguCyYvFKIAlpHXiDZ3WH-yK84Nj0iTTQ",
  },
};

/**
 * Reusable function to perform a fetch request with the given URL and predefined options.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>} - A promise that resolves to the JSON response, or rejects with an error.
 */
export async function fetchWithOptions(url, processResponseFn) {
  // Use the global 'options' object defined above for all requests
  return fetch(baseUrl + url, options)
    .then(async (response) => {
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        // Throw an error if the response status is not OK
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse and return the JSON response
      const json = await response.json();
      if (processResponseFn) {
        return processResponseFn(json);
      } else {
        return json;
      }
    })
    .catch((error) => {
      // Log the error for debugging purposes
      console.error(`Fetch error for URL ${url}:`, error);
      // Rethrow the error so it can be handled by the caller if needed
      return [];
    });
}

export async function fetchUrlsList(urlsList, processResponseFn) {
  try {
    const callPromises = urlsList.map(async (url) => {
      return fetchWithOptions(url);
    });

    const urlsListResponses = await Promise.all(callPromises);
    if (processResponseFn) {
      return urlsListResponses.map(processResponseFn);
    } else {
      return urlsListResponses;
    }
  } catch (error) {
    console.error("❌ Error fetching urls list:", error);
    throw error;
  }
}

export function writeToFile(json, _filename) {
  const outputDir = path.join(__dirname, "output");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = _filename || `site_ids_${new Date().toISOString().split("T")[0]}.json`;
  const filepath = path.join(outputDir, filename);

  try {
    // Write the site ID objects to JSON file with pretty formatting
    fs.writeFileSync(filepath, JSON.stringify(json, null, 2));
    console.log(`✅ Site ID objects written to: ${filepath}`);
    console.log(`📊 Total objects saved: ${json.length}`);
  } catch (error) {
    console.error("❌ Error writing JSON file:", error);
    throw error;
  }
}

// test the function

// fetchWithOptions('sites/by-base-url/aHR0cHM6Ly9xdWFsY29tbS5jb20=')
//     .then(response => console.log(response))
//     .catch(err => console.error(err));

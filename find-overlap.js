import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const domain = "sunstar.com";
const siteId = "542ad116-ed33-448a-a123-06cbcd7c1d4c";

function findOverlap() {

  const ahrefsData = JSON.parse(fs.readFileSync("output/ahrefs-top-200-pages.json", "utf8"));
  const rumData = JSON.parse(fs.readFileSync("output/RUM-sunstar.com-top-pages.json", "utf8"));
  const auditPages = JSON.parse(fs.readFileSync("output/sunstar_oppty_pages.json", "utf8"));

  console.log("Finding overlap");

  const ahrefsPages = ahrefsData.find(data => data.siteId === siteId).topPages;

  const rumPages = rumData.map(o => o.url);
//   console.log({auditPages});


  const overlapPages = [];

  for (const page of auditPages) {
    if (rumPages.includes(page) && ahrefsPages.includes(page)) {
      overlapPages.push(page);
    }
  }

  console.log("=====overlap=====");
  console.log(overlapPages);
  return overlapPages;
}


findOverlap();


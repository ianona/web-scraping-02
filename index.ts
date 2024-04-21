import "module-alias/register";
import {
  createWebsite,
  findWebsiteByUrl,
  getAllWebsites,
  IWebsite,
} from "./models/website.model";
import { ARIWebsite } from "./websites/ari";
import db from "./models";
/*

DESCRIPTION 

The goal of this project is to scrape the content and metadata from a specific website. We want to be able to subsequently scrape the same website to monitor for content changes. 
We also want to monitor the scraping process and log any errors. 

Study the models and try to infer as much information as you can.  

SCRAPING FLOW  

First we create an entry for the website we want to scrape, keep in mind that this is a single unique entry for any website we want to scrape, act accordingly 

Then we create a Job entry, this is where we store information about the links gathered and the pages scraped 
We can refer to these Job objects for historical or troubleshooting reasons. 

Content objects are then created with the scraped page content,  we checksum the content and compare against existing content entries. 
We commit new or modified content to the database while keeping the previous content in database.  Page objects store a reference to the content, not the actual content itself.   

SUGGESTED LIBRARIES 

Axios 
JSDOM 

WEBSITE ( refer to the included png files for content to scrape )

Gather Links on https://www.ird.gov.hk/eng/ppr/arc.htm

Example of Link to be scraped https://www.ird.gov.hk/eng/ppr/advance13.htm

*/

// define a website as a link and functions dictating how to scrape it
export interface WebsiteEntry {
  url: string;
  name: string;
  description: string;
  scrapingFn: (w: IWebsite) => void;
}

const WEBSITES: WebsiteEntry[] = [ARIWebsite];

async function main(): Promise<void> {
  // First we create an entry for the website we want to scrape, keep in mind that this is a single unique entry for any website we want to scrape, act accordingly
  for (const website of WEBSITES) {
    console.log(`[Scraping] Starting: ${website.url}`);
    let websiteObj = await findWebsiteByUrl(website.url);
    console.log(
      `[Scraping] ${
        websiteObj
          ? "Entry exists"
          : "Entry does not exist, creating new website entry"
      }`
    );
    if (!websiteObj) {
      websiteObj = await createWebsite({
        name: website.name,
        url: website.url,
        description: website.description,
        jobs: [],
        content: [],
      });
    }

    website.scrapingFn(websiteObj);
    console.log(`[Scraping] Done: ${websiteObj.url}`);
  }
}

(async () => {
  await db.mongoose.connect(db.url);
  console.log("[MongoDB] Connection Success");
  const allWebsites = await getAllWebsites();
  console.log("ALL WEBSITES", allWebsites);
  main();
})();

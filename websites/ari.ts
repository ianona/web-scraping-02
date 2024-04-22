import { JSDOM } from "jsdom";
import { Types } from "mongoose";
import {
  createContent,
  findContentByChecksum,
  IContent,
} from "@/models/content.model";
import { IPage, Page } from "@/classes/page.class";
import {
  calculateChecksum,
  fetchHTML,
  isNotNullOrUndefined,
} from "@/models/utils";
import { createJob, updateJobById } from "@/models/job.model";
import { IWebsite, updateWebsiteById } from "@/models/website.model";
import { WebsiteEntry } from "..";

interface CaseSummary {
  number: string | null;
  url: string | null;
  relevantProvisions: string | null; // this can further be parsed as array of strings
  index: string[] | null;
}

// if we want cases to be identified more flexibly, we can do so with
// interface CaseSummary {
//   [key:string]: string | number;
// }

interface AdvancedRulingFaqGroup {
  title: string;
  cases: CaseSummary[];
}

function parseIndex(cell: HTMLTableCellElement): string[] {
  const ul = cell.querySelector("ul");
  return ul
    ? Array.from(ul.querySelectorAll("li"))
        .map((li) => li.textContent?.trim() ?? null)
        .filter(isNotNullOrUndefined<string>)
    : [];
}

function getAdvanceRulingGroups(dom: JSDOM): AdvancedRulingFaqGroup[] {
  const document: Document = dom.window.document;
  const toggleDivs: NodeListOf<HTMLDivElement> =
    document.querySelectorAll("div.toggle_div");

  // Iterate over the NodeList
  const ariGroups = Array.from(toggleDivs).map((div) => {
    const parentNode = div.parentNode;
    // Get the text content of child div with class faq_title
    const faqTitle =
      div.querySelector("div.faq_title")?.textContent?.trim() ?? "";

    // Get the table element if found inside the parent div
    const table = parentNode?.querySelector("table");
    if (table) {
      const rows = table.querySelectorAll("tr");
      const cases: CaseSummary[] = Array.from(rows)
        .slice(1)
        .map((row) => {
          const cells = Array.from(row.querySelectorAll("td"));
          if (cells.length !== 3) {
            throw Error("Expecting 3 cells per row of data");
          }
          const caseUrl = cells[0].querySelector("a")?.href ?? null;
          // optimistic approach
          return {
            number: cells[0].textContent ?? null,
            relevantProvisions: cells[1].textContent ?? null,
            index: parseIndex(cells[2]),
            url: caseUrl,
          };
        });

      return {
        title: faqTitle,
        cases,
      };
    } else {
      throw Error("Table expected under ARI FAQ grouping");
    }
  });

  return ariGroups;
}

function buildLinksFromARIGroups(
  ariGroups: AdvancedRulingFaqGroup[]
): string[] {
  return ariGroups
    .flatMap((group) =>
      group.cases.map((c) => "https://www.ird.gov.hk" + c.url)
    )
    .filter(isNotNullOrUndefined);
}

const PAGE_TITLE_SELECTOR = "div.content-title-div";
const PAGE_CONTENT_SELECTOR = "div.content-div";
const PAGE_DATE_SELECTOR = "input#lastUpdatedDate";

enum Status {
  Finished = "finished",
  Stopped = "stopped",
  Ongoing = "ongoing",
  Error = "error",
}

async function scrapeLinks(
  links: string[],
  jobId: Types.ObjectId
): Promise<{ contents: IContent[]; pages: IPage[] }> {
  const pages: IPage[] = [];
  const contents: IContent[] = [];
  for (const [index, link] of links.entries()) {
    // update job progress
    updateJobById(jobId, {
      progress: {
        phase: "pages",
        current: {
          pageIndex: index,
        },
      },
    });

    try {
      const dom = await JSDOM.fromURL(link, {
        runScripts: "dangerously",
        resources: "usable",
      });

      const window = dom.window;
      const document: Document = window.document;

      async function waitForPageLoad() {
        return new Promise<HTMLElement | null>((resolve) => {
          document.addEventListener("DOMContentLoaded", () => {
            resolve(document.querySelector("footer"));
          });
        });
      }

      const footer = await waitForPageLoad();
      const title =
        document.querySelector(PAGE_TITLE_SELECTOR)?.textContent?.trim() ??
        undefined;
      const content =
        document.querySelector(PAGE_CONTENT_SELECTOR)?.textContent?.trim() ??
        undefined;
      // there's an input element with ID "lastUpdatedDate"
      const revisionDateElement: HTMLInputElement | null =
        document.querySelector(PAGE_DATE_SELECTOR);

      // but does not match footer text for actual revision date
      const footerText = footer ? footer.textContent : null;
      const regex =
        /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g;
      let match;
      const parsedDate =
        footerText && (match = regex.exec(footerText)) !== null
          ? match[0]
          : null;

      // prioritize actual footer text and fallback on input element value
      const revisionDate = parsedDate
        ? parsedDate
        : revisionDateElement?.value ?? null;

      // Content objects are then created with the scraped page content
      const scrapedContent: {
        title?: string;
        content?: string;
        revisionDate: string | null;
      } = {
        title,
        content,
        revisionDate,
      };

      // checksum done on processed content, not raw HTML
      const curChecksum = calculateChecksum(scrapedContent);

      // We checksum the content and compare against existing content entries.
      let existingContent = await findContentByChecksum(curChecksum);
      if (!existingContent) {
        // We commit new or modified content to the database while keeping the previous content in database
        existingContent = await createContent({
          url: link,
          title: title,
          // contentType:"html",
          documentType: "html",
          metadata: {
            revisionDate,
          },
          content,
          date: new Date(),
          checksum: curChecksum,
        });
      }

      // Page objects store a reference to the content, not the actual content itself.
      pages.push(
        new Page({
          url: link,
          title,
          content: existingContent._id,
          status: Status.Finished,
        })
      );
      contents.push(existingContent);
      console.log(`[Page Scrape] Done: ${link}`);
    } catch (err: any) {
      console.error(`[Page Scrape] Error: ${err.message}`);
      pages.push(
        new Page({
          url: link,
          status: Status.Error,
          error: err.message,
        })
      );
    }
  }

  return {
    contents,
    pages,
  };
}

async function scrapeARI(websiteObj: IWebsite) {
  // create job
  const job = await createJob({
    website: websiteObj._id,
  });

  // let pages: IPage[] = [];
  let websiteContent: IContent[] = [];

  // run job
  console.log(`[Scraping] Starting job: ${job._id}`);
  try {
    const html: string | null = await fetchHTML(websiteObj.url);
    if (html) {
      const dom: JSDOM = new JSDOM(html);
      const ariGroups = getAdvanceRulingGroups(dom);
      const links = buildLinksFromARIGroups(ariGroups);

      console.log("[Scraping] Links Scrape Success");
      // update job links
      updateJobById(job._id, {
        links: links.map((l) => ({ url: l })),
        progress: {
          phase: "pages",
          current: {
            pageIndex: 0,
          },
        },
      });

      const { contents, pages } = await scrapeLinks(links, job._id);
      console.log("[Scraping] Pages Scrape Success");
      websiteContent = contents;

      updateJobById(job._id, {
        status: Status.Finished,
        endTime: new Date(),
        pages,
      });
      console.log("[Scraping] Pages Scrape Success");
    } else {
      throw Error("HTML fetch failed");
    }
  } catch (e: any) {
    // Fail job
    console.log(`[Scraping - Failed] Job ID: ${job._id}`);
    updateJobById(job._id, {
      status: Status.Error,
      endTime: new Date(),
      error: {
        code: e.code,
        message: e.message,
      },
    });
  }
  return { job, content: websiteContent };
}

export const ARIWebsite: WebsiteEntry = {
  name: "Advance Ruling Cases for the Inland Revenue Department",
  description:
    "List of tax rulings regarding the application of tax laws to specific transactions or situations by the Inland Revenue Department of Hong Kong",
  url: "https://www.ird.gov.hk/eng/ppr/arc.htm",
  startJob: scrapeARI,
};

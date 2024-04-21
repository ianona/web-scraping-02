"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARIWebsite = void 0;
const jsdom_1 = require("jsdom");
const content_model_1 = require("@/models/content.model");
const page_class_1 = require("@/classes/page.class");
const utils_1 = require("@/models/utils");
const job_model_1 = require("@/models/job.model");
const website_model_1 = require("@/models/website.model");
const jquery = require("jquery");
function parseIndex(cell) {
    const ul = cell.querySelector("ul");
    return ul
        ? Array.from(ul.querySelectorAll("li"))
            .map((li) => { var _a, _b; return (_b = (_a = li.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : null; })
            .filter((utils_1.isNotNullOrUndefined))
        : [];
}
function getAdvanceRulingGroups(dom) {
    const document = dom.window.document;
    const toggleDivs = document.querySelectorAll("div.toggle_div");
    // Iterate over the NodeList
    const ariGroups = Array.from(toggleDivs).map((div) => {
        var _a, _b, _c;
        const parentNode = div.parentNode;
        // Get the text content of child div with class faq_title
        const faqTitle = (_c = (_b = (_a = div.querySelector("div.faq_title")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
        // Get the table element if found inside the parent div
        const table = parentNode === null || parentNode === void 0 ? void 0 : parentNode.querySelector("table");
        if (table) {
            const rows = table.querySelectorAll("tr");
            const cases = Array.from(rows)
                .slice(1)
                .map((row) => {
                var _a, _b, _c, _d;
                const cells = Array.from(row.querySelectorAll("td"));
                if (cells.length !== 3) {
                    throw Error("Expecting 3 cells per row of data");
                }
                const caseUrl = (_b = (_a = cells[0].querySelector("a")) === null || _a === void 0 ? void 0 : _a.href) !== null && _b !== void 0 ? _b : null;
                // optimistic approach
                return {
                    number: (_c = cells[0].textContent) !== null && _c !== void 0 ? _c : null,
                    relevantProvisions: (_d = cells[1].textContent) !== null && _d !== void 0 ? _d : null,
                    index: parseIndex(cells[2]),
                    url: caseUrl,
                };
            });
            return {
                title: faqTitle,
                cases,
            };
        }
        else {
            throw Error("Table expected under ARI FAQ grouping");
        }
    });
    return ariGroups;
}
function buildLinksFromARIGroups(ariGroups) {
    return ariGroups
        .flatMap((group) => group.cases.map((c) => "https://www.ird.gov.hk" + c.url))
        .filter(utils_1.isNotNullOrUndefined);
}
const PAGE_TITLE_SELECTOR = "div.content-title-div";
const PAGE_CONTENT_SELECTOR = "div.content-div";
// const PAGE_DATE_SELECTOR = "input#lastUpdatedDate";
const PAGE_DATE_SELECTOR = "input#lastUpdatedDate";
var Status;
(function (Status) {
    Status["Finished"] = "finished";
    Status["Stopped"] = "stopped";
    Status["Ongoing"] = "ongoing";
    Status["Error"] = "error";
})(Status || (Status = {}));
function scrapeLinks(links, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const pages = [];
        const contents = [];
        for (const [index, link] of links.entries()) {
            // update job progress
            (0, job_model_1.updateJobById)(jobId, {
                progress: {
                    phase: "pages",
                    current: {
                        pageIndex: index,
                    },
                },
            });
            if (link !== "https://www.ird.gov.hk/eng/ppr/advance16.htm") {
                continue;
            }
            try {
                const dom = yield jsdom_1.JSDOM.fromURL(link, {
                    runScripts: "dangerously",
                    resources: "usable",
                });
                const window = dom.window;
                const document = window.document;
                function waitForPageLoad() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new Promise((resolve) => {
                            document.addEventListener("DOMContentLoaded", () => {
                                resolve(document.querySelector("footer"));
                            });
                        });
                    });
                }
                const footer = yield waitForPageLoad();
                console.log("footer", footer === null || footer === void 0 ? void 0 : footer.outerHTML);
                // const window = dom.window;
                // const document: Document = window.document;
                // (global as any).window = window;
                // global.document = document;
                // // const $ = require("jquery")(window);
                // const $ = jquery(window);
                // const footerScript = document.querySelector("footer script");
                // document.addEventListener("DOMContentLoaded", () => {
                //   console.log("HELLO WORLD", document.querySelector("footer")?.outerHTML);
                // });
                // if (footerScript && footerScript.textContent) {
                //   dom.window.eval(footerScript.textContent);
                // }
                const title = (_c = (_b = (_a = document.querySelector(PAGE_TITLE_SELECTOR)) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : undefined;
                const content = (_f = (_e = (_d = document.querySelector(PAGE_CONTENT_SELECTOR)) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : undefined;
                // there's an input element with ID "lastUpdatedDate"
                const revisionDateElement = document.querySelector(PAGE_DATE_SELECTOR);
                // but does not match footer text for actual revision date
                const footerText = footer ? footer.textContent : null;
                const regex = /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g;
                let match;
                const parsedDate = footerText && (match = regex.exec(footerText)) !== null
                    ? match[0]
                    : null;
                // prioritize actual footer text and fallback on input element value
                const revisionDate = parsedDate
                    ? parsedDate
                    : (_g = revisionDateElement === null || revisionDateElement === void 0 ? void 0 : revisionDateElement.value) !== null && _g !== void 0 ? _g : null;
                // Content objects are then created with the scraped page content
                const scrapedContent = {
                    title,
                    content,
                    revisionDate,
                };
                console.log("scrapedContent", scrapedContent);
                // checksum done on processed content, not raw HTML
                const curChecksum = (0, utils_1.calculateChecksum)(scrapedContent);
                // We checksum the content and compare against existing content entries.
                let existingContent = yield (0, content_model_1.findContentByChecksum)(curChecksum);
                if (!existingContent) {
                    // We commit new or modified content to the database while keeping the previous content in database
                    existingContent = yield (0, content_model_1.createContent)({
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
                pages.push(new page_class_1.Page({
                    url: link,
                    title,
                    content: existingContent._id,
                    status: Status.Finished,
                }));
                contents.push(existingContent);
                console.log(`[Page Scrape] Done: ${link}`);
            }
            catch (err) {
                console.error(`[Page Scrape] Error: ${err.message}`);
                pages.push(new page_class_1.Page({
                    url: link,
                    status: Status.Error,
                    error: err.message,
                }));
            }
        }
        return {
            contents,
            pages,
        };
    });
}
function scrapeARI(websiteObj) {
    return __awaiter(this, void 0, void 0, function* () {
        // create job
        const job = yield (0, job_model_1.createJob)({
            website: websiteObj._id,
        });
        // let pages: IPage[] = [];
        let websiteContent = [];
        // run job
        console.log(`[Scraping] Starting job: ${job._id}`);
        try {
            const html = yield (0, utils_1.fetchHTML)(websiteObj.url);
            if (html) {
                const dom = new jsdom_1.JSDOM(html);
                const ariGroups = getAdvanceRulingGroups(dom);
                const links = buildLinksFromARIGroups(ariGroups);
                console.log("[Scraping] Links Scrape Success");
                // update job links
                (0, job_model_1.updateJobById)(job._id, {
                    links: links.map((l) => ({ url: l })),
                    progress: {
                        phase: "pages",
                        current: {
                            pageIndex: 0,
                        },
                    },
                });
                const { contents, pages } = yield scrapeLinks(links, job._id);
                console.log("[Scraping] Pages Scrape Success");
                websiteContent = contents;
                // Output valid URLs
                // console.log("OUTPUT");
                // console.log(
                //   ariGroups.forEach((ar) => console.log("arcases", ar.cases))
                // );
                // console.log(links);
                (0, job_model_1.updateJobById)(job._id, {
                    status: Status.Finished,
                    endTime: new Date(),
                    pages,
                });
                console.log("[Scraping] Pages Scrape Success");
            }
            else {
                throw Error("HTML fetch failed");
            }
        }
        catch (e) {
            // Fail job
            console.log(`[Scraping - Failed] Job ID: ${job._id}`);
            (0, job_model_1.updateJobById)(job._id, {
                status: Status.Error,
                endTime: new Date(),
                error: {
                    code: e.code,
                    message: e.message,
                },
            });
        }
        // Add job to website
        (0, website_model_1.updateWebsiteById)(websiteObj._id, {
            jobs: [...websiteObj.jobs, job._id],
            content: websiteContent.map((wc) => wc._id),
        });
    });
}
exports.ARIWebsite = {
    name: "Advance Ruling Cases for the Inland Revenue Department",
    description: "List of tax rulings regarding the application of tax laws to specific transactions or situations by the Inland Revenue Department of Hong Kong",
    url: "https://www.ird.gov.hk/eng/ppr/arc.htm",
    scrapingFn: scrapeARI,
};

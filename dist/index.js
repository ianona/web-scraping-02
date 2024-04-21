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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const website_model_1 = require("./models/website.model");
const ari_1 = require("./websites/ari");
const models_1 = __importDefault(require("./models"));
const WEBSITES = [ari_1.ARIWebsite];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // First we create an entry for the website we want to scrape, keep in mind that this is a single unique entry for any website we want to scrape, act accordingly
        for (const website of WEBSITES) {
            console.log(`[Scraping] Starting: ${website.url}`);
            let websiteObj = yield (0, website_model_1.findWebsiteByUrl)(website.url);
            console.log(`[Scraping] ${websiteObj
                ? "Entry exists"
                : "Entry does not exist, creating new website entry"}`);
            if (!websiteObj) {
                websiteObj = yield (0, website_model_1.createWebsite)({
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
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.default.mongoose.connect(models_1.default.url);
    console.log("[MongoDB] Connection Success");
    const allWebsites = yield (0, website_model_1.getAllWebsites)();
    console.log("ALL WEBSITES", allWebsites);
    main();
}))();

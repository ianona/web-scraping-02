"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const content_model_1 = require("./content.model");
const job_model_1 = require("./job.model");
const website_model_1 = require("./website.model");
const dbConfig = require("@/config/db.config");
const db = {
    mongoose: mongoose_1.default,
    url: dbConfig.url,
    website: website_model_1.Website,
    job: job_model_1.Job,
    content: content_model_1.Content,
};
exports.default = db;

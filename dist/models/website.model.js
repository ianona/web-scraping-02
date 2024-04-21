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
exports.findWebsiteByUrl = exports.deleteWebsiteById = exports.updateWebsiteById = exports.getAllWebsites = exports.createWebsite = exports.Website = void 0;
// const { Schema, model } = require("mongoose");
const mongoose_1 = require("mongoose");
const utils_1 = require("./utils");
const websiteSchema = new mongoose_1.Schema({
    name: {
        type: String,
        unique: true,
    },
    url: String,
    description: String,
    jobs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Job" }],
    content: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Content" }],
});
// Create the model
exports.Website = (0, mongoose_1.model)("Website", websiteSchema);
// CRUD
exports.createWebsite = (0, utils_1.generateCreate)(exports.Website);
exports.getAllWebsites = (0, utils_1.generateGetAll)(exports.Website);
exports.updateWebsiteById = (0, utils_1.generateUpdateById)(exports.Website);
exports.deleteWebsiteById = (0, utils_1.generateDeleteById)(exports.Website);
function findWebsiteByUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const website = yield exports.Website.findOne({ url });
            return website; // Returns null if no document found with the given URL
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.findWebsiteByUrl = findWebsiteByUrl;

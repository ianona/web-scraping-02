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
exports.findContentByChecksum = exports.createContent = exports.Content = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("./utils");
const contentSchema = new mongoose_1.Schema({
    url: String,
    refNo: String,
    title: String,
    contentType: String,
    documentType: {
        type: String,
        enum: ["pdf", "html", "docx", "json"],
    },
    parentDocument: { type: mongoose_1.Schema.Types.ObjectId, ref: "Content" },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    website: { type: mongoose_1.Schema.Types.ObjectId, ref: "Website" },
    content: String,
    date: Date,
    checksum: String,
});
exports.Content = (0, mongoose_1.model)("Content", contentSchema);
exports.createContent = (0, utils_1.generateCreate)(exports.Content);
function findContentByChecksum(checksum) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield exports.Content.findOne({ checksum });
            return content; // Returns null if no document found with the given URL
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.findContentByChecksum = findContentByChecksum;

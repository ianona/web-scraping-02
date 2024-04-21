"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.isNotNullOrUndefined = exports.calculateChecksum = exports.generateDeleteById = exports.generateUpdateById = exports.generateGetAll = exports.generateCreate = exports.fetchHTML = void 0;
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
// Function to fetch HTML content using Axios
function fetchHTML(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            throw new Error("HTML fetch error: " + error.message);
        }
    });
}
exports.fetchHTML = fetchHTML;
function generateCreate(model) {
    return (data) => __awaiter(this, void 0, void 0, function* () {
        try {
            const newEntry = yield model.create(data);
            return newEntry;
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.generateCreate = generateCreate;
function generateGetAll(model) {
    return () => __awaiter(this, void 0, void 0, function* () {
        try {
            const entries = yield model.find();
            return entries;
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.generateGetAll = generateGetAll;
function generateUpdateById(model) {
    return (id, update) => __awaiter(this, void 0, void 0, function* () {
        try {
            const updated = yield model.findByIdAndUpdate(id, update, {
                new: true,
            });
            return updated;
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.generateUpdateById = generateUpdateById;
function generateDeleteById(model) {
    return (id) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield model.findByIdAndDelete(id);
        }
        catch (error) {
            throw new Error("Mongoose error: " + error.message);
        }
    });
}
exports.generateDeleteById = generateDeleteById;
function calculateChecksum(object) {
    const stringifiedObject = JSON.stringify(object);
    const hash = crypto.createHash("md5").update(stringifiedObject).digest("hex");
    return hash;
}
exports.calculateChecksum = calculateChecksum;
function isNotNullOrUndefined(value) {
    return value !== null && value !== undefined;
}
exports.isNotNullOrUndefined = isNotNullOrUndefined;

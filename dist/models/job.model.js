"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobById = exports.createJob = exports.Job = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("./utils");
const jobSchema = new mongoose_1.Schema({
    website: { type: mongoose_1.Schema.Types.ObjectId, ref: "Website" },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    status: {
        type: String,
        enum: ["ongoing", "stopped", "finished", "error"],
        default: "ongoing",
    },
    error: {
        code: String,
        message: String,
    },
    links: [
        {
            type: mongoose_1.Schema.Types.Mixed,
            default: {},
        },
    ],
    progress: {
        phase: {
            type: String,
            enum: ["links", "pages"],
            default: "links",
        },
        current: {
            type: mongoose_1.Schema.Types.Mixed,
            default: {},
        },
    },
    pages: Array,
});
exports.Job = (0, mongoose_1.model)("Job", jobSchema);
// CRUD
exports.createJob = (0, utils_1.generateCreate)(exports.Job);
exports.updateJobById = (0, utils_1.generateUpdateById)(exports.Job);

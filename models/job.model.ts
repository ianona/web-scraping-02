import { Document, model, Model, Schema } from "mongoose";
import { Types } from "mongoose";
import { generateCreate, generateUpdateById } from "./utils";

export interface IJob extends Document {
  website: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: "ongoing" | "stopped" | "finished" | "error";
  error?: {
    code: string;
    message: string;
  };
  links: { [key: string]: any }[]; // Array of objects with dynamic keys and any values
  progress: {
    phase: "links" | "pages";
    current: { [key: string]: any }; // Dynamic keys and any values
  };
  pages: any[]; // Array of any type
}
const jobSchema = new Schema({
  website: { type: Schema.Types.ObjectId, ref: "Website" },
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
      type: Schema.Types.Mixed,
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
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  pages: Array,
});

export const Job: Model<IJob> = model<IJob>("Job", jobSchema);

// CRUD
export const createJob = generateCreate(Job);
export const updateJobById = generateUpdateById(Job);

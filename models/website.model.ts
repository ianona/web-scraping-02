// const { Schema, model } = require("mongoose");
import { Schema, Document, Model, Types, model } from "mongoose";
import {
  generateCreate,
  generateDeleteById,
  generateGetAll,
  generateUpdateById,
} from "./utils";

// const websiteSchema = new Schema({
//   name: {
//     type: String,
//     unique: true,
//   },
//   url: String,
//   description: String,
//   jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
//   content: [{ type: Schema.Types.ObjectId, ref: "Content" }],
// });

// const Website = model("Website", websiteSchema);

// module.exports = { Website, websiteSchema };

export interface IWebsite extends Document {
  name: string;
  url: string;
  description: string;
  jobs: Types.ObjectId[];
  content: Types.ObjectId[];
}

const websiteSchema: Schema<IWebsite> = new Schema<IWebsite>({
  name: {
    type: String,
    unique: true,
  },
  url: String,
  description: String,
  jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
  content: [{ type: Schema.Types.ObjectId, ref: "Content" }],
});

// Create the model
export const Website: Model<IWebsite> = model<IWebsite>(
  "Website",
  websiteSchema
);

// CRUD
export const createWebsite = generateCreate(Website);
export const getAllWebsites = generateGetAll(Website);
export const updateWebsiteById = generateUpdateById(Website);
export const deleteWebsiteById = generateDeleteById(Website);
export async function findWebsiteByUrl(url: string): Promise<IWebsite | null> {
  try {
    const website = await Website.findOne({ url });
    return website; // Returns null if no document found with the given URL
  } catch (error: any) {
    throw new Error("Mongoose error: " + error.message);
  }
}

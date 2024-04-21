import { Document, Types, Schema, Model, model } from "mongoose";
import { generateCreate } from "./utils";

export interface IContent extends Document {
  url: string;
  refNo: string;
  title: string;
  contentType: string;
  documentType: "pdf" | "html" | "docx" | "json";
  parentDocument: Types.ObjectId;
  metadata: Record<string, any>;
  website: Types.ObjectId;
  content: string;
  date: Date;
  checksum: string;
}

const contentSchema = new Schema({
  url: String,
  refNo: String,
  title: String,
  contentType: String,
  documentType: {
    type: String,
    enum: ["pdf", "html", "docx", "json"],
  },
  parentDocument: { type: Schema.Types.ObjectId, ref: "Content" },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  website: { type: Schema.Types.ObjectId, ref: "Website" },
  content: String,
  date: Date,
  checksum: String,
});

export const Content: Model<IContent> = model<IContent>(
  "Content",
  contentSchema
);
export const createContent = generateCreate(Content);
export async function findContentByChecksum(
  checksum: string
): Promise<IContent | null> {
  try {
    const content = await Content.findOne({ checksum });
    return content; // Returns null if no document found with the given URL
  } catch (error: any) {
    throw new Error("Mongoose error: " + error.message);
  }
}

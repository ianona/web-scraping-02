import mongoose from "mongoose";
import { Content } from "./content.model";
import { Job } from "./job.model";
import { Website } from "./website.model";
const dbConfig = require("@/config/db.config");

const db = {
  mongoose,
  url: dbConfig.url,
  website: Website,
  job: Job,
  content: Content,
};
export default db;

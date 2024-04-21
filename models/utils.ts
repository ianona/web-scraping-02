import { Types } from "mongoose";
import { Model } from "mongoose";
import * as crypto from "crypto";
import axios, { AxiosResponse } from "axios";

// Function to fetch HTML content using Axios
export async function fetchHTML(url: string): Promise<string> {
  try {
    const response: AxiosResponse<string> = await axios.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error("HTML fetch error: " + error.message);
  }
}

export function generateCreate<T>(
  model: Model<T>
): (data: Partial<T>) => Promise<T> {
  return async (data: Partial<T>) => {
    try {
      const newEntry = await model.create(data);
      return newEntry;
    } catch (error: any) {
      throw new Error("Mongoose error: " + error.message);
    }
  };
}

export function generateGetAll<T>(model: Model<T>): () => Promise<T[]> {
  return async () => {
    try {
      const entries = await model.find();
      return entries;
    } catch (error: any) {
      throw new Error("Mongoose error: " + error.message);
    }
  };
}

export function generateUpdateById<T>(
  model: Model<T>
): (id: Types.ObjectId, update: Partial<T>) => Promise<T | null> {
  return async (id: Types.ObjectId, update: Partial<T>) => {
    try {
      const updated = await model.findByIdAndUpdate(id, update, {
        new: true,
      });
      return updated;
    } catch (error: any) {
      throw new Error("Mongoose error: " + error.message);
    }
  };
}

export function generateDeleteById<T>(
  model: Model<T>
): (id: Types.ObjectId) => Promise<void> {
  return async (id: Types.ObjectId) => {
    try {
      await model.findByIdAndDelete(id);
    } catch (error: any) {
      throw new Error("Mongoose error: " + error.message);
    }
  };
}

export function calculateChecksum(object: any): string {
  const stringifiedObject = JSON.stringify(object);
  const hash = crypto.createHash("md5").update(stringifiedObject).digest("hex");
  return hash;
}

export function isNotNullOrUndefined<T>(
  value: T | null | undefined
): value is T {
  return value !== null && value !== undefined;
}

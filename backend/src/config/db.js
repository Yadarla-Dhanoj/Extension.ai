import mongoose from "mongoose";
import { env } from "./env.js";

let dbConnected = false;

export function isDbConnected() {
  return dbConnected;
}

export async function connectDb() {
  if (!env.mongoUri) {
    console.warn("MONGO_URI missing. Running in in-memory fallback mode.");
    dbConnected = false;
    return;
  }
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2500 });
    dbConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.warn(`MongoDB unavailable (${err.message}). Running in in-memory fallback mode.`);
    dbConnected = false;
  }
}

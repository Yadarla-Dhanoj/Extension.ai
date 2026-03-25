import mongoose from "mongoose";
import { env } from "./env.js";

let dbConnected = false;

export function isDbConnected() {
  return dbConnected;
}

export async function connectDb() {
  if (!env.mongoUri) {
    console.log("MONGO_URI not set. Using local JSON DB (no MongoDB required).");
    dbConnected = false;
    return;
  }
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2500 });
    dbConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log(
      `MongoDB not reachable (${err.message}). Using local JSON DB (this is OK for dev).`
    );
    dbConnected = false;
  }
}

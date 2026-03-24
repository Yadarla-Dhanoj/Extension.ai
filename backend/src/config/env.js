import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePriceProMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  apiUrl: process.env.API_URL || "http://localhost:5000"
};

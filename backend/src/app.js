import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { auth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/authRoutes.js";
import { billingRouter } from "./routes/billingRoutes.js";
import { createGenerationRouter } from "./routes/generationRoutes.js";
import { projectRouter } from "./routes/projectRoutes.js";
import { ensureDownloadsDir } from "./services/extensionService.js";
import { isDbConnected } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const downloadsDir = path.join(__dirname, "..", "downloads");

export async function createApp() {
  await ensureDownloadsDir(downloadsDir);

  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        // Allow common local dev origins even if users use different hostnames.
        const allowedLocalPrefixes = [
          "http://localhost:",
          "http://127.0.0.1:",
          "http://0.0.0.0:",
          "http://[::1]:",
          "http://::1:",
          "https://localhost:",
          "https://127.0.0.1:",
          "https://0.0.0.0:",
          "https://[::1]:",
          "https://::1:"
        ];
        const isLocalDev = allowedLocalPrefixes.some((p) => origin.startsWith(p));
        if (isLocalDev) return callback(null, true);
        // Allow the configured frontend origin as well (production / custom ports).
        if (origin === env.frontendUrl) return callback(null, true);
        return callback(new Error("CORS blocked for this origin"), false);
      }
    })
  );
  app.use("/downloads", express.static(downloadsDir));

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, databaseMode: isDbConnected() ? "mongodb" : "local-json-db" })
  );
  app.use("/api/auth", authRouter);
  app.use("/api/projects", auth, projectRouter);
  app.use("/api/generate", auth, createGenerationRouter({ downloadsDir }));
  app.use("/api/billing", auth, billingRouter);

  app.use(errorHandler);
  return app;
}

import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  try {
    await connectDb();
    const app = await createApp();
    const server = app.listen(env.port, () => {
      console.log(`Extensio backend listening on ${env.port}`);
    });
    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(
          `Port ${env.port} is already in use. Stop the other process or change PORT in backend/.env.`
        );
        process.exit(1);
      }
      console.error("Server error:", err?.message || err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

bootstrap();

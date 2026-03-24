import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  try {
    await connectDb();
    const app = await createApp();
    app.listen(env.port, () => {
      console.log(`Extensio backend listening on ${env.port}`);
    });
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

bootstrap();

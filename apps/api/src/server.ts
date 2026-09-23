import { loadEnvironment } from "@zayloq/config";
import {
  disconnectDatabase,
  disconnectRedis
} from "@zayloq/database";
import { buildApp } from "./app.js";

const env = loadEnvironment();

const app = await buildApp({ environment: env });

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  app.log.info({ signal }, "Shutdown requested.");

  try {
    await app.close();

    await Promise.allSettled([
      disconnectDatabase(),
      disconnectRedis()
    ]);

    app.log.info("Zayloq API stopped cleanly.");

    process.exit(0);
  } catch (error) {
    app.log.error(
      { error },
      "Zayloq API shutdown failed."
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({
    host: env.API_HOST,
    port: env.API_PORT
  });

  app.log.info(
    {
      host: env.API_HOST,
      port: env.API_PORT,
      environment: env.ZAYLOQ_ENV
    },
    "Zayloq Control Plane API started."
  );
} catch (error) {
  app.log.fatal(
    { error },
    "Unable to start Zayloq API."
  );

  process.exit(1);
}

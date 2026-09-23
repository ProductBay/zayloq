import { loadEnvironment } from "@zayloq/config";
import { createLogger } from "@zayloq/observability";

const env = loadEnvironment();

const logger = createLogger({
  service: "zayloq-worker",
  level: env.LOG_LEVEL
});

let shuttingDown = false;

logger.info(
  {
    environment: env.ZAYLOQ_ENV
  },
  "Zayloq Worker started."
);

function shutdown(signal: string): void {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  logger.info(
    { signal },
    "Worker shutdown requested."
  );

  logger.info("Zayloq Worker stopped cleanly.");

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const heartbeat = setInterval(() => {
  logger.debug("Worker heartbeat.");
}, 30000);

heartbeat.unref();

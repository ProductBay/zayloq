import type { FastifyInstance } from "fastify";

import {
  checkDatabaseHealth,
  checkRedisHealth
} from "@zayloq/database";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      service: "api",
      status: "ok",
      version: "0.0.0",
      timestamp: new Date().toISOString()
    };
  });

  app.get("/ready", async (_request, reply) => {
    const startedAt = performance.now();

    const [database, redis] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth()
    ]);

    const ready =
      database.status === "ok" &&
      redis.status === "ok";

    const payload = {
      service: "api",
      status: ready ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      latencyMs: Math.round(performance.now() - startedAt),
      dependencies: {
        database,
        redis
      }
    };

    return reply
      .code(ready ? 200 : 503)
      .send(payload);
  });
}

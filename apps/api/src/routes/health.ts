import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      service: "api",
      status: "ok",
      version: "0.0.0",
      timestamp: new Date().toISOString()
    };
  });

  app.get("/ready", async () => {
    return {
      service: "api",
      status: "ok",
      timestamp: new Date().toISOString()
    };
  });
}

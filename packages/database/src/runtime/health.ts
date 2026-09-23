import { prisma } from "./client.js";

export type DatabaseHealth = {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
};

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      latencyMs: Math.round(performance.now() - startedAt)
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - startedAt),
      error:
        error instanceof Error
          ? error.message
          : "Unknown database health-check failure."
    };
  }
}

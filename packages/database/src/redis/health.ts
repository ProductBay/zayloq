import { redis } from "./client.js";

export type RedisHealth = {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
};

export async function checkRedisHealth(): Promise<RedisHealth> {
  const startedAt = performance.now();

  try {
    const response = await redis.ping();

    if (response !== "PONG") {
      throw new Error(`Unexpected Redis PING response: ${response}`);
    }

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
          : "Unknown Redis health-check failure."
    };
  }
}

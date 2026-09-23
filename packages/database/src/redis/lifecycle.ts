import { redis } from "./client.js";

export async function connectRedis(): Promise<void> {
  if (redis.status === "ready") {
    return;
  }

  if (redis.status === "connecting" || redis.status === "connect") {
    await waitForRedisReady();
    return;
  }

  await redis.connect();
}

async function waitForRedisReady(): Promise<void> {
  if (redis.status === "ready") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const onReady = (): void => {
      cleanup();
      resolve();
    };

    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };

    const cleanup = (): void => {
      redis.off("ready", onReady);
      redis.off("error", onError);
    };

    redis.once("ready", onReady);
    redis.once("error", onError);
  });
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === "end") {
    return;
  }

  try {
    await redis.quit();
  } catch {
    redis.disconnect();
  }
}

export function isRedisReady(): boolean {
  return redis.status === "ready";
}

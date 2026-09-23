import Redis from "ioredis";

type RedisRuntime = {
  client?: Redis;
};

const globalRuntime = globalThis as typeof globalThis & {
  __zayloqRedisRuntime?: RedisRuntime;
};

function requireRedisUrl(): string {
  const value = process.env.REDIS_URL?.trim();

  if (!value) {
    throw new Error(
      "REDIS_URL is required to initialize the Zayloq Redis runtime."
    );
  }

  return value;
}

function createRedisClient(): Redis {
  return new Redis(requireRedisUrl(), {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
  });
}

const runtime =
  globalRuntime.__zayloqRedisRuntime ??
  (globalRuntime.__zayloqRedisRuntime = {});

export const redis =
  runtime.client ??
  (runtime.client = createRedisClient());

export function getRedisClient(): Redis {
  return redis;
}

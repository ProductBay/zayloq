import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/client/client.js";

type PrismaRuntime = {
  prisma?: PrismaClient;
};

const globalRuntime = globalThis as typeof globalThis & {
  __zayloqPrismaRuntime?: PrismaRuntime;
};

function requireDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error(
      "DATABASE_URL is required to initialize the Zayloq database runtime."
    );
  }

  return value;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: requireDatabaseUrl()
  });

  return new PrismaClient({
    adapter
  });
}

const runtime =
  globalRuntime.__zayloqPrismaRuntime ??
  (globalRuntime.__zayloqPrismaRuntime = {});

export const prisma =
  runtime.prisma ??
  (runtime.prisma = createPrismaClient());

export function getDatabaseClient(): PrismaClient {
  return prisma;
}

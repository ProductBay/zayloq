import type { PrismaClient, TransactionClient } from "@zayloq/database";

export type AuthDatabase = PrismaClient | TransactionClient;

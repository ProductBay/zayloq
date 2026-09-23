import type { Prisma } from "../generated/client/client.js";

import { prisma } from "./client.js";

export type TransactionClient = Prisma.TransactionClient;

export async function withTransaction<T>(
  operation: (transaction: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (transaction) => {
    return operation(transaction);
  });
}

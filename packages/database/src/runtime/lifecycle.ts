import { prisma } from "./client.js";

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) {
    return;
  }

  await prisma.$connect();
  connected = true;
}

export async function disconnectDatabase(): Promise<void> {
  if (!connected) {
    return;
  }

  await prisma.$disconnect();
  connected = false;
}

export function isDatabaseConnected(): boolean {
  return connected;
}

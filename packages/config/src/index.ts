import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  ZAYLOQ_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),

  API_HOST: z.string().default("0.0.0.0"),

  API_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(4000),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info")
});

export type ZayloqEnvironment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env
): ZayloqEnvironment {
  const result = environmentSchema.safeParse(source);

  if (!result.success) {
    console.error("Invalid Zayloq environment configuration.");
    console.error(result.error.flatten().fieldErrors);

    throw new Error("Zayloq environment validation failed.");
  }

  return result.data;
}

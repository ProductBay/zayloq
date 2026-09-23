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
    .default("info"),

  AUTH_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000),
  AUTH_EMAIL_VERIFICATION_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  AUTH_PASSWORD_RESET_TTL_SECONDS: z.coerce.number().int().positive().default(3_600),
  AUTH_SESSION_TOUCH_INTERVAL_SECONDS: z.coerce.number().int().nonnegative().default(300)
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

const authEnvironmentSchema = environmentSchema.pick({
  AUTH_SESSION_TTL_SECONDS: true,
  AUTH_EMAIL_VERIFICATION_TTL_SECONDS: true,
  AUTH_PASSWORD_RESET_TTL_SECONDS: true,
  AUTH_SESSION_TOUCH_INTERVAL_SECONDS: true
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export function loadAuthEnvironment(
  source: NodeJS.ProcessEnv = process.env
): AuthEnvironment {
  const result = authEnvironmentSchema.safeParse(source);

  if (!result.success) {
    throw new Error("Zayloq authentication configuration validation failed.");
  }

  return result.data;
}

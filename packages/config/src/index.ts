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

  API_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(1_048_576).default(16_384),

  API_TRUST_PROXY: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),

  AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),

  AUTH_COOKIE_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/).default("zayloq_session"),

  AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  AUTH_REGISTRATION_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RECOVERY_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  AUTH_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(900),

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

export interface ApiAuthEnvironment {
  bodyLimitBytes: number;
  cookieName: string;
  trustedOrigins: string[];
  loginRateLimitMax: number;
  registrationRateLimitMax: number;
  recoveryRateLimitMax: number;
  rateLimitWindowSeconds: number;
}

export function loadApiAuthEnvironment(source: NodeJS.ProcessEnv = process.env): ApiAuthEnvironment {
  const environment = environmentSchema.pick({
    API_BODY_LIMIT_BYTES: true,
    AUTH_COOKIE_NAME: true,
    AUTH_TRUSTED_ORIGINS: true,
    AUTH_LOGIN_RATE_LIMIT_MAX: true,
    AUTH_REGISTRATION_RATE_LIMIT_MAX: true,
    AUTH_RECOVERY_RATE_LIMIT_MAX: true,
    AUTH_RATE_LIMIT_WINDOW_SECONDS: true
  }).parse(source);
  const trustedOrigins = environment.AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (trustedOrigins.length === 0 || trustedOrigins.some((origin) => origin === "*")) {
    throw new Error("AUTH_TRUSTED_ORIGINS must contain explicit origins and cannot contain a wildcard.");
  }
  for (const origin of trustedOrigins) new URL(origin);
  return {
    bodyLimitBytes: environment.API_BODY_LIMIT_BYTES,
    cookieName: environment.AUTH_COOKIE_NAME,
    trustedOrigins,
    loginRateLimitMax: environment.AUTH_LOGIN_RATE_LIMIT_MAX,
    registrationRateLimitMax: environment.AUTH_REGISTRATION_RATE_LIMIT_MAX,
    recoveryRateLimitMax: environment.AUTH_RECOVERY_RATE_LIMIT_MAX,
    rateLimitWindowSeconds: environment.AUTH_RATE_LIMIT_WINDOW_SECONDS
  };
}

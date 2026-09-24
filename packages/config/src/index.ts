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

  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_DEFAULT_PROVIDER: z.enum(["OPENAI"]).default("OPENAI"),
  AI_FAST_MODEL: z.string().min(1).optional(),
  AI_REASONING_MODEL: z.string().min(1).optional(),
  AI_GENERATION_MODEL: z.string().min(1).optional(),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(600_000).default(60_000),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1).max(100_000).default(8_192),
  AI_MAX_REQUEST_CHARS: z.coerce.number().int().min(1_000).max(10_000_000).default(200_000),
  AI_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(4).default(2),
  AI_GLOBAL_CONCURRENCY: z.coerce.number().int().min(1).max(1_000).default(20),
  AI_ORGANIZATION_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(5),
  AI_USER_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(2),

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

const aiEnvironmentSchema = environmentSchema.pick({ OPENAI_API_KEY: true, AI_DEFAULT_PROVIDER: true, AI_FAST_MODEL: true, AI_REASONING_MODEL: true, AI_GENERATION_MODEL: true, AI_REQUEST_TIMEOUT_MS: true, AI_MAX_OUTPUT_TOKENS: true, AI_MAX_REQUEST_CHARS: true, AI_RETRY_ATTEMPTS: true, AI_GLOBAL_CONCURRENCY: true, AI_ORGANIZATION_CONCURRENCY: true, AI_USER_CONCURRENCY: true });
export type AiEnvironment = Omit<z.infer<typeof aiEnvironmentSchema>, "OPENAI_API_KEY" | "AI_FAST_MODEL" | "AI_REASONING_MODEL" | "AI_GENERATION_MODEL"> & { OPENAI_API_KEY: string; AI_FAST_MODEL: string; AI_REASONING_MODEL: string; AI_GENERATION_MODEL: string; };
export function loadAiEnvironment(source: NodeJS.ProcessEnv = process.env): AiEnvironment {
  const result = aiEnvironmentSchema.safeParse(source);
  if (!result.success || !result.data.OPENAI_API_KEY || !result.data.AI_FAST_MODEL || !result.data.AI_REASONING_MODEL || !result.data.AI_GENERATION_MODEL) throw new Error("Zayloq AI configuration is incomplete.");
  return result.data as AiEnvironment;
}
export function getAiConfigurationState(source: NodeJS.ProcessEnv = process.env) {
  const parsed = aiEnvironmentSchema.safeParse(source); const value = parsed.success ? parsed.data : undefined;
  return { configured: Boolean(value?.OPENAI_API_KEY && value.AI_FAST_MODEL && value.AI_REASONING_MODEL && value.AI_GENERATION_MODEL), provider: value?.AI_DEFAULT_PROVIDER ?? "OPENAI", models: { fast: Boolean(value?.AI_FAST_MODEL), reasoning: Boolean(value?.AI_REASONING_MODEL), generation: Boolean(value?.AI_GENERATION_MODEL) } };
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

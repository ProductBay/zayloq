import pino from "pino";

export interface LoggerOptions {
  service: string;
  level?: string;
}

export function createLogger({
  service,
  level = "info"
}: LoggerOptions) {
  return pino({
    name: service,
    level,

    base: {
      service
    },

    redact: {
      paths: [
        "password",
        "authorization",
        "req.headers.authorization",
        "DATABASE_URL",
        "REDIS_URL",
        "*.password",
        "*.token",
        "*.secret"
      ],
      censor: "[REDACTED]"
    }
  });
}

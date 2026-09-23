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
        "cookie",
        "req.headers.authorization",
        "req.headers.cookie",
        "req.body.password",
        "req.body.newPassword",
        "req.body.token",
        "headers.authorization",
        "headers.cookie",
        "body.password",
        "body.newPassword",
        "body.token",
        "DATABASE_URL",
        "REDIS_URL",
        "*.password",
        "*.newPassword",
        "*.token",
        "*.sessionToken",
        "*.secret"
      ],
      censor: "[REDACTED]"
    }
  });
}

import pino, { type DestinationStream } from "pino";

export interface LoggerOptions {
  service: string;
  level?: string;
  destination?: DestinationStream;
}

export const SENSITIVE_LOG_PATHS = [
  "password", "authorization", "cookie", "req.headers.authorization", "req.headers.cookie", "req.body.password", "req.body.newPassword", "req.body.token", "headers.authorization", "headers.cookie", "body.password", "body.newPassword", "body.token", "DATABASE_URL", "REDIS_URL", "OPENAI_API_KEY", "apiKey", "headers.Authorization", "providerHeaders.authorization", "*.apiKey", "*.authorization", "*.providerSecret", "*.password", "*.newPassword", "*.token", "*.sessionToken", "*.secret"
];

export function createLogger({
  service,
  level = "info",
  destination
}: LoggerOptions) {
  return pino({
    name: service,
    level,

    base: {
      service
    },

    redact: {
      paths: SENSITIVE_LOG_PATHS,
      censor: "[REDACTED]"
    }
  }, destination);
}

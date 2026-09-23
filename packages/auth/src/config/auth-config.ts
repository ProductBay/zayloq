import { loadAuthEnvironment } from "@zayloq/config";

export interface AuthConfig {
  sessionTtlMs: number;
  emailVerificationTtlMs: number;
  passwordResetTtlMs: number;
  sessionTouchIntervalMs: number;
}

export function loadAuthConfig(source: NodeJS.ProcessEnv = process.env): AuthConfig {
  const environment = loadAuthEnvironment(source);
  return {
    sessionTtlMs: environment.AUTH_SESSION_TTL_SECONDS * 1_000,
    emailVerificationTtlMs: environment.AUTH_EMAIL_VERIFICATION_TTL_SECONDS * 1_000,
    passwordResetTtlMs: environment.AUTH_PASSWORD_RESET_TTL_SECONDS * 1_000,
    sessionTouchIntervalMs: environment.AUTH_SESSION_TOUCH_INTERVAL_SECONDS * 1_000
  };
}

import { getDatabaseClient, type PrismaClient } from "@zayloq/database";

import { AuthenticationService, RegistrationService } from "./account/index.js";
import { loadAuthConfig, type AuthConfig } from "./config/index.js";
import { PasswordResetService } from "./password-reset/index.js";
import { SessionService } from "./sessions/index.js";
import { EmailVerificationService } from "./verification/index.js";

export class AuthService {
  readonly registration: RegistrationService;
  readonly authentication: AuthenticationService;
  readonly sessions: SessionService;
  readonly emailVerification: EmailVerificationService;
  readonly passwordReset: PasswordResetService;

  constructor(config: AuthConfig = loadAuthConfig(), db: PrismaClient = getDatabaseClient()) {
    this.registration = new RegistrationService(config, db);
    this.authentication = new AuthenticationService(config, db);
    this.sessions = new SessionService(config, db);
    this.emailVerification = new EmailVerificationService(config, db);
    this.passwordReset = new PasswordResetService(config, db);
  }
}

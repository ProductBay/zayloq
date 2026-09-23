export type AuthDeliveryKind = "email-verification" | "password-reset";

export interface AuthTokenDeliveryRequest {
  kind: AuthDeliveryKind;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
}

export interface AuthTokenDelivery {
  deliver(request: AuthTokenDeliveryRequest): Promise<{ accepted: boolean }>;
}

export class UnavailableAuthTokenDelivery implements AuthTokenDelivery {
  async deliver(): Promise<{ accepted: boolean }> { return { accepted: false }; }
}

/** Explicitly non-production adapter for automated tests and local development. */
export class MemoryAuthTokenDelivery implements AuthTokenDelivery {
  private readonly deliveries: AuthTokenDeliveryRequest[] = [];
  async deliver(request: AuthTokenDeliveryRequest): Promise<{ accepted: boolean }> {
    this.deliveries.push({ ...request });
    return { accepted: true };
  }
  latest(kind: AuthDeliveryKind, userId: string): AuthTokenDeliveryRequest | undefined {
    return this.deliveries.findLast((item) => item.kind === kind && item.userId === userId);
  }
  clear(): void { this.deliveries.length = 0; }
}

export const ZAYLOQ_PLATFORM_NAME = "Zayloq";

export type ServiceName =
  | "api"
  | "worker"
  | "studio"
  | "marketing";

export type HealthStatus = "ok" | "degraded" | "unhealthy";

export interface ServiceHealth {
  service: ServiceName;
  status: HealthStatus;
  version: string;
  timestamp: string;
}

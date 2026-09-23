import { createHash } from "node:crypto";
import { getRedisClient, redisKey } from "@zayloq/database";
import type Redis from "ioredis";

export interface RateLimitRequest { action: string; ipAddress: string; identity?: string; limit: number; windowSeconds: number; }
export interface RateLimitResult { allowed: boolean; remaining: number; retryAfterSeconds: number; }
export interface AuthRateLimiter { consume(request: RateLimitRequest): Promise<RateLimitResult>; }

function digest(value: string): string { return createHash("sha256").update(value).digest("hex").slice(0, 32); }
export function authRateLimitKey(input: Pick<RateLimitRequest, "action" | "ipAddress" | "identity">): string {
  return redisKey("auth-rate", input.action, digest(input.ipAddress), digest(input.identity?.trim().toLowerCase() ?? "none"));
}

const SCRIPT = `local value = redis.call('INCR', KEYS[1]); if value == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('TTL', KEYS[1]); return {value, ttl}`;

export class RedisAuthRateLimiter implements AuthRateLimiter {
  constructor(private readonly redis: Redis = getRedisClient()) {}
  async consume(request: RateLimitRequest): Promise<RateLimitResult> {
    const result = await this.redis.eval(SCRIPT, 1, authRateLimitKey(request), request.windowSeconds) as [number, number];
    const count = Number(result[0]);
    const retryAfterSeconds = Math.max(1, Number(result[1]));
    return { allowed: count <= request.limit, remaining: Math.max(0, request.limit - count), retryAfterSeconds };
  }
}

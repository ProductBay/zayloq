import { redisKey } from "@zayloq/database/redis-keys";
import type { AiAttribution } from "../contracts/types.js";
import { AiError } from "../errors/ai-error.js";
export interface AiConcurrencyLease { release(): Promise<void>; }
export interface AiConcurrencyController { acquire(metadata?: AiAttribution, signal?: AbortSignal): Promise<AiConcurrencyLease>; }
export interface AiConcurrencyLimits { global: number; organization: number; user: number; leaseSeconds?: number; }
interface RedisEvalClient { eval(script: string, numberOfKeys: number, ...args: Array<string | number>): Promise<unknown>; }
function scopes(metadata: AiAttribution | undefined, limits: AiConcurrencyLimits) { return [{ key: "global", limit: limits.global }, ...(metadata?.organizationId ? [{ key: `organization:${metadata.organizationId}`, limit: limits.organization }] : []), ...(metadata?.userId ? [{ key: `user:${metadata.userId}`, limit: limits.user }] : [])]; }
export class InMemoryConcurrencyController implements AiConcurrencyController {
  private readonly counts = new Map<string, number>(); constructor(private readonly limits: AiConcurrencyLimits) {}
  async acquire(metadata?: AiAttribution, signal?: AbortSignal): Promise<AiConcurrencyLease> { if (signal?.aborted) throw new AiError("CANCELLED", "The AI request was cancelled."); const selected = scopes(metadata, this.limits); if (selected.some(({ key, limit }) => (this.counts.get(key) ?? 0) >= limit)) throw new AiError("CONCURRENCY_LIMITED", "AI capacity is temporarily busy.", true, 1_000); selected.forEach(({ key }) => this.counts.set(key, (this.counts.get(key) ?? 0) + 1)); let released = false; return { release: async () => { if (released) return; released = true; selected.forEach(({ key }) => this.counts.set(key, Math.max(0, (this.counts.get(key) ?? 1) - 1))); } }; }
}
const ACQUIRE = `for i,key in ipairs(KEYS) do local current=tonumber(redis.call('GET',key) or '0'); if current>=tonumber(ARGV[i]) then return 0 end end; for i,key in ipairs(KEYS) do redis.call('INCR',key); redis.call('EXPIRE',key,ARGV[#KEYS+1]); end; return 1`;
const RELEASE = `for _,key in ipairs(KEYS) do local current=tonumber(redis.call('GET',key) or '0'); if current<=1 then redis.call('DEL',key) else redis.call('DECR',key) end end; return 1`;
export class RedisConcurrencyController implements AiConcurrencyController {
  constructor(private readonly limits: AiConcurrencyLimits, private readonly redis: RedisEvalClient) {}
  async acquire(metadata?: AiAttribution, signal?: AbortSignal): Promise<AiConcurrencyLease> { if (signal?.aborted) throw new AiError("CANCELLED", "The AI request was cancelled."); const selected = scopes(metadata, this.limits); const keys = selected.map(({ key }) => redisKey("ai-concurrency", key)); const result = Number(await this.redis.eval(ACQUIRE, keys.length, ...keys, ...selected.map(({ limit }) => limit), this.limits.leaseSeconds ?? 120)); if (result !== 1) throw new AiError("CONCURRENCY_LIMITED", "AI capacity is temporarily busy.", true, 1_000); let released = false; return { release: async () => { if (released) return; released = true; await this.redis.eval(RELEASE, keys.length, ...keys); } }; }
}

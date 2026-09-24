import { loadAiEnvironment, type AiEnvironment } from "@zayloq/config";
import { createLogger } from "@zayloq/observability";
import { AiGateway } from "./ai-gateway.js";
import { RedisConcurrencyController } from "./concurrency.js";
import { OpenAiProvider } from "../providers/openai/openai-provider.js";
import { AiProviderRegistry } from "../providers/registry.js";
export async function createAiGateway(config: AiEnvironment = loadAiEnvironment()) { const { getRedisClient } = await import("@zayloq/database/redis"); const registry = new AiProviderRegistry().register(new OpenAiProvider(config.OPENAI_API_KEY)); const concurrency = new RedisConcurrencyController({ global: config.AI_GLOBAL_CONCURRENCY, organization: config.AI_ORGANIZATION_CONCURRENCY, user: config.AI_USER_CONCURRENCY, leaseSeconds: Math.ceil(config.AI_REQUEST_TIMEOUT_MS / 1_000) + 30 }, getRedisClient()); return new AiGateway(config, registry, concurrency, createLogger({ service: "zayloq-ai" })); }

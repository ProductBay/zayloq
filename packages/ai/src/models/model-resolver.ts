import type { AiEnvironment } from "@zayloq/config";
import type { AiModelRole, AiProviderName } from "../contracts/types.js";
export class ModelResolver { constructor(private readonly config: AiEnvironment) {} provider(): AiProviderName { return this.config.AI_DEFAULT_PROVIDER; } resolve(role: AiModelRole): string { return { FAST: this.config.AI_FAST_MODEL, REASONING: this.config.AI_REASONING_MODEL, GENERATION: this.config.AI_GENERATION_MODEL }[role]; } }

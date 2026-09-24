import type { AiEnvironment } from "@zayloq/config";
import type { AiModelRole, AiProviderName } from "../contracts/types.js";
export class ModelResolver {
  constructor(private readonly config: AiEnvironment) {}
  provider(requested?: AiProviderName): AiProviderName { return requested ?? this.config.AI_DEFAULT_PROVIDER; }
  resolve(role: AiModelRole, provider: AiProviderName = this.provider()): string {
    const models = provider === "OPENAI" ? { FAST: this.config.AI_FAST_MODEL, REASONING: this.config.AI_REASONING_MODEL, GENERATION: this.config.AI_GENERATION_MODEL } : { FAST: this.config.ZAYLOQ_AI_GEMINI_FAST_MODEL, REASONING: this.config.ZAYLOQ_AI_GEMINI_REASONING_MODEL, GENERATION: this.config.ZAYLOQ_AI_GEMINI_GENERATION_MODEL };
    const model = models[role]; if (!model) throw new Error(`AI model role ${role} is not configured for ${provider}.`); return model;
  }
}

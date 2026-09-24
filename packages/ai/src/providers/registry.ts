import type { AiProvider, AiProviderName } from "../contracts/types.js";
import { AiError } from "../errors/ai-error.js";
export class AiProviderRegistry { private readonly providers = new Map<AiProviderName, AiProvider>(); register(provider: AiProvider) { this.providers.set(provider.name, provider); return this; } get(name: AiProviderName): AiProvider { const provider = this.providers.get(name); if (!provider) throw new AiError("UNKNOWN_PROVIDER", "The configured AI provider is unavailable."); return provider; } }

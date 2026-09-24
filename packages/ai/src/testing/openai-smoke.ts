import { getAiConfigurationState, loadAiEnvironment } from "@zayloq/config";
import { createAiGateway } from "../gateway/factory.js";
const state = getAiConfigurationState();
if (!state.configured) { console.log("OpenAI smoke: SKIPPED (AI configuration unavailable)."); process.exit(0); }
const config = loadAiEnvironment(); const gateway = await createAiGateway(config); const result = await gateway.generateText({ task: "text", modelRole: "FAST", system: "Follow the user's exact output instruction.", messages: [{ role: "user", content: "Return exactly the word ZAYLOQ_READY." }], maxOutputTokens: 16 });
if (result.output.trim() !== "ZAYLOQ_READY") throw new Error("OpenAI smoke response did not match the expected value.");
console.log(JSON.stringify({ provider: result.provider, model: result.model, success: true, latencyMs: result.latencyMs, usage: result.usage }));

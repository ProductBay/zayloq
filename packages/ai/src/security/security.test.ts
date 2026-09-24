import assert from "node:assert/strict";
import { test } from "node:test";
import { Writable } from "node:stream";
import { getAiConfigurationState, loadAiEnvironment } from "@zayloq/config";
import { createLogger } from "@zayloq/observability";
test("AI configuration diagnostics expose state but never secrets", () => { const source = { NODE_ENV: "test", OPENAI_API_KEY: "sk-secret", AI_FAST_MODEL: "fast", AI_REASONING_MODEL: "reason", AI_GENERATION_MODEL: "generation" } as NodeJS.ProcessEnv; const state = getAiConfigurationState(source); assert.equal(state.configured, true); assert.equal(JSON.stringify(state).includes("sk-secret"), false); assert.throws(() => loadAiEnvironment({ NODE_ENV: "test", OPENAI_API_KEY: "sk-secret" } as NodeJS.ProcessEnv), (error: unknown) => error instanceof Error && !error.message.includes("sk-secret")); });
test("observability redacts provider secrets and authorization", () => { let output = ""; const destination = new Writable({ write(chunk, _encoding, callback) { output += chunk.toString(); callback(); } }); const logger = createLogger({ service: "redaction-test", destination }); logger.info({ OPENAI_API_KEY: "sk-secret", apiKey: "sk-secret-2", headers: { Authorization: "Bearer secret" } }, "safe"); assert.equal(output.includes("sk-secret"), false); assert.equal(output.includes("Bearer secret"), false); assert.match(output, /\[REDACTED\]/); });

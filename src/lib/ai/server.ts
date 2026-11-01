import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

import { serverEnv } from "@/lib/env";
import { SYSTEM_PROMPT, TASK_PROMPTS } from "./prompts";
import { AI_FEATURES, type AiFeature, type AiOutput } from "./schemas";

const DEFAULT_MODEL = "claude-opus-5-5";
let client: Anthropic | null = null;

export class AiUnavailableError extends Error {}

export function aiConfig() {
  const env = serverEnv();
  return { enabled: env.AI_ENABLED && !!env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL || DEFAULT_MODEL, apiKey: env.ANTHROPIC_API_KEY };
}

/**
 * Tek bir AI özelliğini çalıştırır. Yanıt şemaya uygun JSON olarak döner.
 * Güvenlik sınıflandırıcısı reddederse sunucu tarafı yedek model devreye girer ("fallbacks: default").
 */
export async function runAi<F extends AiFeature>(feature: F, input: unknown): Promise<AiOutput<F>> {
  const cfg = aiConfig();
  if (!cfg.enabled) throw new AiUnavailableError("AI asistan kapalı.");
  client ??= new Anthropic({ apiKey: cfg.apiKey });

  const response = await client.beta.messages.parse({
    model: cfg.model,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(AI_FEATURES[feature].output) },
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: `${TASK_PROMPTS[feature]}\n\n<veri>\n${JSON.stringify(input, null, 2)}\n</veri>` },
    ],
  });

  if (response.stop_reason === "refusal") throw new AiUnavailableError("Asistan bu isteğe yanıt veremedi.");
  if (!response.parsed_output) throw new Error("Yanıt beklenen biçimde değil.");
  return response.parsed_output as AiOutput<F>;
}

"use client";

import { SAMPLES } from "./samples";
import type { AiFeature, AiInput, AiOutput } from "./schemas";

declare const __IVL_PREVIEW__: boolean | undefined;
export const isPreviewBuild = typeof __IVL_PREVIEW__ !== "undefined" && __IVL_PREVIEW__;

export type AiResult<F extends AiFeature> = { data: AiOutput<F>; sample: boolean };

/** AI isteği: asıl uygulamada sunucuya, önizlemede kural tabanlı örneğe gider. */
export async function askAi<F extends AiFeature>(feature: F, input: AiInput<F>): Promise<AiResult<F>> {
  if (isPreviewBuild) {
    await new Promise((r) => setTimeout(r, 900)); // gerçek istek hissi için kısa bekleme
    return { data: SAMPLES[feature](input), sample: true };
  }
  const res = await fetch(`/api/ai/${feature}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json().catch(() => ({}))) as { result?: AiOutput<F>; error?: string };
  if (!res.ok || !json.result) throw new Error(json.error ?? "AI yanıt vermedi.");
  return { data: json.result, sample: false };
}

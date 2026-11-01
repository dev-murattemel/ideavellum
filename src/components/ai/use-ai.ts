"use client";

import * as React from "react";

import { askAi, type AiResult } from "@/lib/ai/client";
import type { AiFeature, AiInput } from "@/lib/ai/schemas";
import { useProfile } from "@/lib/data/hooks";

export const useAiEnabled = () => useProfile().ai_enabled;

export function useAi<F extends AiFeature>(feature: F) {
  const [state, setState] = React.useState<{ loading: boolean; result: AiResult<F> | null; error: string | null }>({ loading: false, result: null, error: null });
  const run = React.useCallback(
    async (input: AiInput<F>) => {
      setState({ loading: true, result: null, error: null });
      try {
        setState({ loading: false, result: await askAi(feature, input), error: null });
      } catch (e) {
        setState({ loading: false, result: null, error: e instanceof Error ? e.message : "AI yanıt vermedi." });
      }
    },
    [feature],
  );
  const reset = () => setState({ loading: false, result: null, error: null });
  return { ...state, run, reset };
}

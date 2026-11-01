"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Mac'te "⌘", diğerlerinde "Ctrl". Sunucuda bilinmez → null. */
export function useModifierKey(): "⌘" | "Ctrl" | null {
  return useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"),
    () => null,
  );
}

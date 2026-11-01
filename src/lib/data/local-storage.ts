"use client";

import { useData } from "./store";
import { TABLE_NAMES, type DataSnapshot, type Profile } from "./types";

const KEY = "ideavellum-data-v1";

type Saved = { version: 1; data: DataSnapshot; profile: Profile };

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    s.getItem(KEY);
    return s;
  } catch {
    return null; // önizleme çerçevesinde depolama kapalı olabilir
  }
}

export function loadLocal(): Saved | null {
  try {
    const raw = storage()?.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    if (parsed.version !== 1) return null;
    TABLE_NAMES.forEach((t) => (parsed.data[t] ??= {} as never));
    return parsed;
  } catch {
    return null;
  }
}

export function clearLocal() {
  try {
    storage()?.removeItem(KEY);
  } catch {
    /* yok say */
  }
}

/** Yerel modda her değişikliği tarayıcıya yazar (kısa gecikmeyle, toplu). */
export function startLocalPersistence() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return useData.subscribe((state) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const data = Object.fromEntries(TABLE_NAMES.map((t) => [t, state[t]])) as unknown as DataSnapshot;
      try {
        storage()?.setItem(KEY, JSON.stringify({ version: 1, data, profile: state.profile } satisfies Saved));
      } catch {
        /* kota dolu ya da kapalı */
      }
    }, 250);
  });
}

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Phase = "focus" | "break" | "long";
export const PRESETS = [
  { id: "25", label: "25 / 5", focus: 25, short: 5, long: 15 },
  { id: "50", label: "50 / 10", focus: 50, short: 10, long: 20 },
  { id: "90", label: "90 / 15", focus: 90, short: 15, long: 30 },
] as const;
export type PresetId = (typeof PRESETS)[number]["id"];

type State = {
  preset: PresetId;
  courseId: string | null;
  intent: string;
  phase: Phase;
  /** Bu turun bitiş anı (ms); null ise duraklatılmış */
  endsAt: number | null;
  /** Duraklatılınca kalan süre (ms) */
  remainingMs: number;
  /** Turun başladığı an (kayıt için) */
  startedAt: string | null;
  done: number; // tamamlanan odak turu
  set: (p: Partial<State>) => void;
};

export const presetOf = (id: PresetId) => PRESETS.find((p) => p.id === id) ?? PRESETS[0];
export const phaseMinutes = (s: Pick<State, "preset" | "phase">) => {
  const p = presetOf(s.preset);
  return s.phase === "focus" ? p.focus : s.phase === "break" ? p.short : p.long;
};

/** Pomodoro durumu: sayfa yenilense de kaldığı yerden sürer */
export const usePomodoro = create<State>()(
  persist(
    (set) => ({
      preset: "25",
      courseId: null,
      intent: "",
      phase: "focus",
      endsAt: null,
      remainingMs: 25 * 60_000,
      startedAt: null,
      done: 0,
      set: (p) => set(p),
    }),
    { name: "ideavellum-pomodoro", storage: createJSONStorage(() => localStorage) },
  ),
);

export const remaining = (s: Pick<State, "endsAt" | "remainingMs">, now = Date.now()) =>
  s.endsAt ? Math.max(0, s.endsAt - now) : s.remainingMs;

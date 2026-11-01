"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { data } from "@/lib/data/store";
import type { StudySource } from "@/lib/data/types";

type TimerState = {
  courseId: string | null;
  topicId: string | null;
  source: StudySource;
  startedAt: string | null; // ilk başlatma (kayıt için)
  runningSince: number | null; // şu anki koşunun başlangıcı (ms)
  accumulatedMs: number; // duraklatmalar öncesi toplam
  start: (courseId: string, source?: StudySource, topicId?: string | null) => void;
  pause: () => void;
  resume: () => void;
  stop: () => { minutes: number } | null;
  discard: () => void;
};

const safeStorage = createJSONStorage(() => {
  try {
    localStorage.getItem("x");
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
  }
});

const idle = { courseId: null, topicId: null, source: "timer" as StudySource, startedAt: null, runningSince: null, accumulatedMs: 0 };

/** Çalışma zamanlayıcısı: sayfa yenilense de kaldığı yerden devam eder. */
export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      ...idle,
      start: (courseId, source = "timer", topicId = null) =>
        set({ courseId, topicId, source, startedAt: new Date().toISOString(), runningSince: Date.now(), accumulatedMs: 0 }),
      pause: () => {
        const s = get();
        if (s.runningSince) set({ accumulatedMs: s.accumulatedMs + Date.now() - s.runningSince, runningSince: null });
      },
      resume: () => set({ runningSince: Date.now() }),
      stop: () => {
        const s = get();
        if (!s.courseId || !s.startedAt) return null;
        const ms = s.accumulatedMs + (s.runningSince ? Date.now() - s.runningSince : 0);
        const minutes = Math.round(ms / 60000);
        if (minutes >= 1) {
          data().insert("study_logs", {
            course_id: s.courseId, topic_id: s.topicId, started_at: s.startedAt,
            ended_at: new Date().toISOString(), duration_minutes: minutes, source: s.source,
          });
        }
        set(idle);
        return { minutes };
      },
      discard: () => set(idle),
    }),
    { name: "ideavellum-timer", storage: safeStorage },
  ),
);

export function elapsedMs(s: Pick<TimerState, "accumulatedMs" | "runningSince">, now = Date.now()) {
  return s.accumulatedMs + (s.runningSince ? now - s.runningSince : 0);
}

export function formatClock(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

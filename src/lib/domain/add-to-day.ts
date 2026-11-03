import { parseISO } from "date-fns";

import { data } from "@/lib/data/store";
import type { AreaKind, Course, EntryCheck } from "@/lib/data/types";
import { isoWeekday } from "@/lib/time";
import { getEntry, saveEntry } from "./session-entries";

/** Rehberden takvime eklenecek şey: bir tarif ya da bir hareket */
export type DayPayload = {
  kind: Extract<AreaKind, "cooking" | "fitness">;
  /** Görünen ad: "Menemen", "Bench press" */
  name: string;
  /** Günün başlığı boşsa bu yazılır */
  title?: string;
  checks: EntryCheck[];
  details?: string;
  /** Yeni saat açılırsa varsayılan saatler */
  start: string;
  end: string;
};

const DEFAULT_COURSE: Record<DayPayload["kind"], Pick<Course, "name" | "color" | "goal">> = {
  cooking: { name: "Mutfak", color: "peach", goal: "Haftalık yemek planı ve yeni tarifler." },
  fitness: { name: "Spor", color: "sky", goal: "Düzenli antrenman." },
};

/** Bu türde ders yoksa "Mutfak" ya da "Spor" adında bir ders açar */
export function ensureCourse(kind: DayPayload["kind"]): Course {
  const state = data();
  const existing = Object.values(state.courses).find((c) => c.kind === kind && c.status === "active");
  if (existing) return existing;
  const term = Object.values(state.terms).find((t) => t.is_active);
  return data().insert("courses", {
    ...DEFAULT_COURSE[kind],
    kind,
    position: null,
    term_id: term?.id ?? null,
    code: null,
    description: null,
    status: "active",
    target_weekly_minutes: null,
    start_date: null,
    target_end_date: null,
    completed_at: null,
    final_reflection: null,
    final_note: null,
    final_rating: null,
  });
}

/**
 * Tarifi ya da hareketi bir güne ekler:
 * - `sessionId` verilirse o günkü var olan saate eklenir (liste ve ayrıntı sona eklenir).
 * - Verilmezse o gün için tek seferlik yeni bir saat açılır.
 */
export function addToDay(p: DayPayload, opts: { courseId: string; date: string; sessionId?: string; start?: string; end?: string }) {
  let sessionId = opts.sessionId;
  if (!sessionId) {
    const created = data().insert("class_sessions", {
      course_id: opts.courseId,
      weekday: isoWeekday(parseISO(opts.date)),
      repeat: "once",
      anchor_date: opts.date,
      start_time: opts.start ?? p.start,
      end_time: opts.end ?? p.end,
      location: null,
      valid_from: null,
      valid_until: null,
      bell_overrides: {},
    });
    sessionId = created.id;
  }
  const current = getEntry(sessionId, opts.date);
  saveEntry(sessionId, opts.date, {
    title: current?.title || p.title || null,
    checklist: [...(current?.checklist ?? []), ...p.checks],
    details: [current?.details, p.details].filter(Boolean).join("\n\n") || null,
  });
  return { sessionId, date: opts.date };
}

import { addDays } from "date-fns";

import { occurrencesOn } from "@/lib/domain/schedule";
import type { BellSettings, ClassSession, Course } from "@/lib/data/types";
import { isoDate, minutesToTime, timeToMinutes, wallToUtc } from "@/lib/time";

export type BellKind = "bell_before" | "bell_start" | "bell_end";

export type BellEvent = {
  id: string; // oturum + tarih + tür: aynı olay iki kez çalmasın
  kind: BellKind;
  fireAt: Date; // UTC
  sessionId: string;
  courseId: string;
  title: string;
  body: string;
};

/**
 * Belirli günler için zil olaylarını üretir. Hem uygulama içi zil hem de sunucudaki
 * hatırlatma üretimi bu tek fonksiyonu kullanır.
 * `fromDay`: kullanıcı saat dilimindeki gün (duvar saati), `days`: kaç gün.
 */
export function bellEvents(
  sessions: ClassSession[],
  courses: Record<string, Course>,
  settings: BellSettings,
  fromDay: Date,
  days: number,
  tz: string,
): BellEvent[] {
  const out: BellEvent[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(fromDay, i);
    const date = isoDate(day);
    occurrencesOn(sessions, courses, day).forEach((o) => {
      const ov = o.session.bell_overrides ?? {};
      const before = ov.before_minutes === undefined ? settings.before_minutes : ov.before_minutes;
      const where = o.session.location ? ` · ${o.session.location}` : "";
      const range = `${o.session.start_time}–${o.session.end_time}`;
      const push = (kind: BellKind, minute: number, title: string, body: string) =>
        out.push({ id: `${o.session.id}|${date}|${kind}`, kind, fireAt: wallToUtc(date, minutesToTime(minute), tz), sessionId: o.session.id, courseId: o.course.id, title, body });
      if (before && before > 0) push("bell_before", timeToMinutes(o.session.start_time) - before, `${o.course.name} ${before} dk sonra başlıyor`, `${range}${where}`);
      if (ov.start_bell ?? settings.start_bell) push("bell_start", timeToMinutes(o.session.start_time), `${o.course.name} başladı`, `${range}${where}`);
      if (ov.end_bell ?? settings.end_bell) push("bell_end", timeToMinutes(o.session.end_time), `${o.course.name} bitti`, "Teneffüs zamanı. Yoklamanı işaretlemeyi unutma.");
    });
  }
  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

/** Sessiz saatler içinde mi? (ör. 23:00–07:00 gece yarısını aşabilir) */
export function inQuietHours(settings: BellSettings, wallMinutes: number) {
  const q = settings.quiet_hours;
  if (!q.enabled) return false;
  const from = timeToMinutes(q.from);
  const to = timeToMinutes(q.to);
  return from <= to ? wallMinutes >= from && wallMinutes < to : wallMinutes >= from || wallMinutes < to;
}

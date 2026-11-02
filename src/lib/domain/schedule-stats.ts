import { addDays } from "date-fns";

import type { Attendance, ClassSession, Course } from "@/lib/data/types";
import { isoDate, minutesOfDay } from "@/lib/time";
import { occurrencesOn, type Occurrence } from "./schedule";

export type WeekStats = {
  /** Planlanan toplam dakika */
  planned: number;
  /** Ders saati sayısı */
  count: number;
  /** Geçmiş saatlerden katıldığın oranı (0–100); yoklama yoksa null */
  rate: number | null;
  missed: number;
  /** Yoklaması girilmemiş geçmiş saatler */
  pending: number;
};

function stats(sessions: ClassSession[], courses: Record<string, Course>, att: Map<string, Attendance["status"]>, days: Date[], now: Date): WeekStats {
  const occ: Occurrence[] = days.flatMap((d) => occurrencesOn(sessions, courses, d));
  const today = isoDate(now);
  const nowMin = minutesOfDay(now);
  const past = occ.filter((o) => {
    const d = isoDate(o.date);
    return d < today || (d === today && o.end <= nowMin);
  });
  const marks = past.map((o) => att.get(`${o.session.id}|${isoDate(o.date)}`));
  const attended = marks.filter((m) => m === "attended").length;
  const missed = marks.filter((m) => m === "missed").length;
  return {
    planned: occ.reduce((n, o) => n + (o.end - o.start), 0),
    count: occ.length,
    rate: attended + missed ? Math.round((attended / (attended + missed)) * 100) : null,
    missed,
    pending: marks.filter((m) => !m).length,
  };
}

/** Görünen hafta ve bir önceki hafta için takvim özeti (üstteki kartlar) */
export function weekCompare(sessions: ClassSession[], courses: Record<string, Course>, attendance: Attendance[], days: Date[], now: Date) {
  const att = new Map(attendance.map((a) => [`${a.class_session_id}|${a.date}`, a.status]));
  return {
    current: stats(sessions, courses, att, days, now),
    previous: stats(sessions, courses, att, days.map((d) => addDays(d, -7)), now),
  };
}

/** Yüzde değişim: önceki 0 ise null */
export const change = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 100) : null);

import { addDays } from "date-fns";

import { isoDate, isoWeekday, minutesOfDay, timeToMinutes } from "@/lib/time";
import type { ClassSession, Course } from "@/lib/data/types";

/** Bir ders saatinin belirli bir tarihte geçerli olup olmadığı */
export function sessionValidOn(s: ClassSession, date: Date) {
  const d = isoDate(date);
  return s.weekday === isoWeekday(date) && (!s.valid_from || s.valid_from <= d) && (!s.valid_until || s.valid_until >= d);
}

export type Occurrence = {
  session: ClassSession;
  course: Course;
  date: Date; // gün (duvar saati)
  start: number; // gün içindeki dakika
  end: number;
};

export function occurrencesOn(sessions: ClassSession[], courses: Record<string, Course>, date: Date): Occurrence[] {
  return sessions
    .filter((s) => sessionValidOn(s, date) && courses[s.course_id] && isLiveCourse(courses[s.course_id]))
    .map((s) => ({
      session: s,
      course: courses[s.course_id],
      date,
      start: timeToMinutes(s.start_time),
      end: timeToMinutes(s.end_time),
    }))
    .sort((a, b) => a.start - b.start);
}

export const isLiveCourse = (c: Course) => c.status === "active";

/** Şu an süren ders ve sıradaki ders (bugün yoksa önümüzdeki 7 gün içinde). */
export function currentAndNext(sessions: ClassSession[], courses: Record<string, Course>, now: Date) {
  const nowMin = minutesOfDay(now);
  const today = occurrencesOn(sessions, courses, now);
  const current = today.find((o) => o.start <= nowMin && nowMin < o.end) ?? null;
  let next = today.find((o) => o.start > nowMin) ?? null;
  let dayOffset = 0;
  for (let i = 1; !next && i <= 7; i++) {
    const day = addDays(now, i);
    next = occurrencesOn(sessions, courses, day)[0] ?? null;
    dayOffset = i;
  }
  return { current, next, nextDayOffset: next ? dayOffset : null };
}

/** Dakika farkını "12 dk", "1 sa 5 dk" biçiminde verir */
export function minutesUntil(target: number, nowMin: number, dayOffset = 0) {
  return Math.max(0, Math.round(target + dayOffset * 1440 - nowMin));
}

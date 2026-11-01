import { addDays, differenceInCalendarDays, getDaysInMonth, parseISO } from "date-fns";

import { isoDate, isoWeekday, minutesOfDay, timeToMinutes } from "@/lib/time";
import type { ClassSession, Course } from "@/lib/data/types";

/** Ayın kaçıncı haftagünü: 8 Nisan Salı → 2 (ayın 2. Salısı); son haftaysa 5 */
export const nthWeekdayOfMonth = (d: Date) => Math.ceil(d.getDate() / 7);
const isLastWeekdayOfMonth = (d: Date) => d.getDate() + 7 > getDaysInMonth(d);

/** Bir program saatinin belirli bir tarihte geçerli olup olmadığı (tekrar kuralıyla birlikte) */
export function sessionValidOn(s: ClassSession, date: Date) {
  const d = isoDate(date);
  if (s.weekday !== isoWeekday(date)) return false;
  if ((s.valid_from && s.valid_from > d) || (s.valid_until && s.valid_until < d)) return false;
  const repeat = s.repeat ?? "weekly";
  if (repeat === "weekly" || !s.anchor_date) return true;
  if (d < s.anchor_date) return false;
  const anchor = parseISO(s.anchor_date);
  if (repeat === "once") return d === s.anchor_date;
  if (repeat === "biweekly") return Math.round(differenceInCalendarDays(date, anchor) / 7) % 2 === 0;
  // Aylık: ayın aynı sıradaki haftagünü (ör. her ayın ilk Salısı); çapa ayın son haftasındaysa "son Salı"
  const n = nthWeekdayOfMonth(anchor);
  return n >= 5 ? isLastWeekdayOfMonth(date) : nthWeekdayOfMonth(date) === n;
}

const ORDINAL = ["ilk", "ikinci", "üçüncü", "dördüncü", "son"];

/** "Her hafta", "2 haftada bir", "Her ayın ilk Salısı", "12 Kasım (tek sefer)" */
export function repeatLabel(s: Pick<ClassSession, "repeat" | "anchor_date" | "weekday">, weekdayNames: string[]) {
  const day = weekdayNames[s.weekday - 1];
  switch (s.repeat ?? "weekly") {
    case "biweekly":
      return `2 haftada bir ${day}`;
    case "monthly":
      return `Her ayın ${ORDINAL[Math.min(4, nthWeekdayOfMonth(s.anchor_date ? parseISO(s.anchor_date) : new Date()) - 1)]} ${day}`;
    case "once":
      return "Tek seferlik";
    default:
      return `Her ${day}`;
  }
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

/** Saati başka güne taşırken tekrar çapasını da aynı gün farkıyla kaydırır. */
export function moveToWeekday(s: ClassSession, weekday: number): Pick<ClassSession, "weekday" | "anchor_date"> {
  if (!s.anchor_date || (s.repeat ?? "weekly") === "weekly") return { weekday, anchor_date: s.anchor_date };
  return { weekday, anchor_date: isoDate(addDays(parseISO(s.anchor_date), weekday - s.weekday)) };
}

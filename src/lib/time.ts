import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

import { DEFAULT_TIMEZONE } from "./dates";

/** Kullanıcının saat dilimindeki "duvar saati" (gösterim ve karşılaştırma için). */
export function zonedNow(tz: string = DEFAULT_TIMEZONE, now: Date = new Date()) {
  return toZonedTime(now, tz);
}

export const isoDate = (d: Date) => format(d, "yyyy-MM-dd");

/** 1 = Pazartesi … 7 = Pazar */
export const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1;

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(min: number) {
  const m = Math.max(0, Math.min(24 * 60, Math.round(min)));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

/** Kullanıcı saat dilimindeki tarih + saati UTC'ye çevirir. */
export function wallToUtc(date: string, time: string, tz: string = DEFAULT_TIMEZONE) {
  return fromZonedTime(`${date}T${time}:00`, tz);
}

export function utcToWall(iso: string, tz: string = DEFAULT_TIMEZONE) {
  return toZonedTime(parseISO(iso), tz);
}

export const weekStart = (d: Date) => startOfWeek(d, { weekStartsOn: 1 });

export function weekDays(d: Date) {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 95 → "1 sa 35 dk", 40 → "40 dk" */
export function formatDuration(min: number) {
  const m = Math.round(min);
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} sa ${r} dk` : `${h} sa`;
}

export function formatShortDate(d: Date) {
  return format(d, "d MMM", { locale: tr });
}

export function fmt(d: Date, pattern: string) {
  return format(d, pattern, { locale: tr });
}

/** "Bugün", "Yarın", "Dün" ya da "4 Kas" */
export function relativeDay(d: Date, today: Date) {
  const diff = differenceInCalendarDays(d, today);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";
  return formatShortDate(d);
}

export const WEEKDAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
export const WEEKDAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/** "2026-11-04" → yerel gün (saat dilimi kayması olmadan) */
export const parseDay = (s: string) => parseISO(s);

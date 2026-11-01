import { tr } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Europe/Istanbul";
export const WEEK_STARTS_ON = 1 as const; // Pazartesi

/** "4 Kasım 2026, Çarşamba" */
export function formatLongDate(date: Date, tz: string = DEFAULT_TIMEZONE) {
  return formatInTimeZone(date, tz, "d MMMM yyyy, EEEE", { locale: tr });
}

/** "19:00" — her zaman 24 saat */
export function formatTime(date: Date, tz: string = DEFAULT_TIMEZONE) {
  return formatInTimeZone(date, tz, "HH:mm", { locale: tr });
}

export function formatInTz(date: Date, pattern: string, tz: string = DEFAULT_TIMEZONE) {
  return formatInTimeZone(date, tz, pattern, { locale: tr });
}

/** Saate göre selam: Günaydın / İyi günler / İyi akşamlar / İyi geceler */
export function greeting(date: Date, tz: string = DEFAULT_TIMEZONE) {
  const hour = toZonedTime(date, tz).getHours();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi günler";
  if (hour >= 18 && hour < 23) return "İyi akşamlar";
  return "İyi geceler";
}

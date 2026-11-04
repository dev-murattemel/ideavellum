import { addDays, subDays } from "date-fns";

import { data } from "@/lib/data/store";
import type { Habit, HabitCheck, Resource, ResourceUnit } from "@/lib/data/types";
import { isoDate, weekStart } from "@/lib/time";

/** Miktarlı alışkanlıklarda seçilebilen birimler */
export const HABIT_UNITS = ["litre", "bardak", "sayfa", "dakika", "saat", "km", "adım", "tekrar", "bölüm"] as const;

/** Addaki miktarı yakalar: "20 Sayfa Kitap Oku" → 20 sayfa, "2 litre su iç" → 2 litre */
const UNIT_ALIASES: Record<string, string> = {
  litre: "litre", lt: "litre", l: "litre", bardak: "bardak", sayfa: "sayfa", sf: "sayfa",
  dakika: "dakika", dk: "dakika", saat: "saat", km: "km", adım: "adım", tekrar: "tekrar", bölüm: "bölüm",
};
export function parseTarget(name: string): { amount: number; unit: string } | null {
  const m = name.toLocaleLowerCase("tr").match(/(\d+(?:[.,]\d+)?)\s*([a-zçğıöşü]+)/);
  if (!m) return null;
  const unit = UNIT_ALIASES[m[2]];
  const amount = Number(m[1].replace(",", "."));
  return unit && amount > 0 ? { amount, unit } : null;
}

/** Alışkanlık birimi ile kaynak birimi eşleşirse kaynağın ilerlemesi de güncellenir */
const UNIT_TO_RESOURCE: Record<string, ResourceUnit> = { sayfa: "page", dakika: "minute", bölüm: "chapter" };

export const hasTarget = (h: Pick<Habit, "target_amount">) => !!h.target_amount && h.target_amount > 0;

/** 1.5 → "1,5"; tam sayılar ondalıksız */
export const fmtAmount = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

/** Hedef metni: "2 litre", "20 sayfa" */
export const targetLabel = (h: Pick<Habit, "target_amount" | "unit">) =>
  hasTarget(h) ? `${fmtAmount(h.target_amount!)}${h.unit ? ` ${h.unit}` : ""}` : null;

/**
 * O gün yapılan miktar; miktar yazılmamış kayıt tam yapılmış sayılır.
 * Miktarı 0 olan kayıt "yapılmadı ama not var" demektir.
 */
export const amountOf = (h: Habit, c?: HabitCheck) => (!c ? 0 : c.amount ?? h.target_amount ?? 1);

/** Günün tamamlanma oranı (0–1) */
export const dayRatio = (h: Habit, c?: HabitCheck) =>
  !c ? 0 : !hasTarget(h) ? (c.amount === 0 ? 0 : 1) : Math.min(1, amountOf(h, c) / h.target_amount!);

/** Alışkanlığın günlük kayıtları (tarih → kayıt) */
export function checksOf(habitId: string, checks: HabitCheck[]) {
  return new Map(checks.filter((c) => c.habit_id === habitId).map((c) => [c.date, c]));
}

/** Hedefine ulaşılan günler (miktarsız alışkanlıkta işaretli her gün) */
export function doneDays(h: Habit, checks: HabitCheck[]) {
  return new Set([...checksOf(h.id, checks).values()].filter((c) => dayRatio(h, c) >= 1).map((c) => c.date));
}

/** Kaydı olan günler (kısmi dahil): seri bunlarla sayılır, yarım gün seriyi bozmaz */
export function loggedDays(habitId: string, checks: HabitCheck[]) {
  return new Set(checks.filter((c) => c.habit_id === habitId && (c.amount == null || c.amount > 0)).map((c) => c.date));
}

/** Art arda kaydı olan gün sayısı (bugün henüz kayıt yoksa dünden geriye) */
export function habitStreak(days: Set<string>, today: Date) {
  let d = days.has(isoDate(today)) ? today : subDays(today, 1);
  let n = 0;
  while (days.has(isoDate(d))) {
    n++;
    d = subDays(d, 1);
  }
  return n;
}

/** Bu hafta kaç gün hedefe ulaşıldı */
export function weekCount(days: Set<string>, today: Date) {
  const start = weekStart(today);
  let n = 0;
  for (let i = 0; i < 7; i++) if (days.has(isoDate(addDays(start, i)))) n++;
  return n;
}

const findCheck = (habitId: string, date: string) =>
  Object.values(data().habit_checks).find((c) => c.habit_id === habitId && c.date === date);

/** Bağlı kaynağın ilerlemesini farka göre günceller (ör. bugün 15 sayfa → kitap +15) */
function syncResource(h: Habit, delta: number) {
  if (!delta || !h.resource_id || !h.unit) return;
  const r: Resource | undefined = data().resources[h.resource_id];
  if (!r || UNIT_TO_RESOURCE[h.unit] !== r.unit) return;
  const total = r.progress_total ?? Infinity;
  const next = Math.max(0, Math.min(total, (r.progress_current ?? 0) + delta));
  data().update("resources", r.id, { progress_current: next, status: next >= total ? "done" : next > 0 ? "in_progress" : "queued" });
}

/**
 * Bir günü miktar ve notla kaydeder (varsa günceller).
 * Miktarsız alışkanlıkta `done: false` notu saklar ama günü yapılmış saymaz.
 */
export function logHabit(h: Habit, date: string, v: { amount?: number | null; note?: string | null; done?: boolean }) {
  const existing = findCheck(h.id, date);
  const before = amountOf(h, existing);
  const amount = hasTarget(h) ? Math.max(0, v.amount ?? h.target_amount!) : v.done === false ? 0 : null;
  const note = v.note?.trim() || null;
  if (!note && amount === 0 && !hasTarget(h)) return clearHabit(h, date);
  if (existing) data().update("habit_checks", existing.id, { amount, note });
  else data().insert("habit_checks", { habit_id: h.id, date, amount, note });
  syncResource(h, (amount ?? 1) - (existing ? before : 0));
}

/** Alışkanlığın notlu ya da kayıtlı günleri, yeniden eskiye */
export function habitHistory(h: Habit, checks: HabitCheck[]) {
  return checks
    .filter((c) => c.habit_id === h.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((c) => ({ check: c, ratio: dayRatio(h, c), amount: amountOf(h, c) }));
}

/** Günün kaydını siler */
export function clearHabit(h: Habit, date: string) {
  const existing = findCheck(h.id, date);
  if (!existing) return;
  data().remove("habit_checks", existing.id);
  syncResource(h, -amountOf(h, existing));
}

/** Tek dokunuş: kayıt yoksa tam olarak işaretler, varsa kaldırır */
export function toggleHabit(h: Habit, date: string) {
  const existing = findCheck(h.id, date);
  // "Yapmadım" diye not bırakılmış gün: notu koruyarak yapıldı yap
  if (existing && !hasTarget(h) && existing.amount === 0) return logHabit(h, date, { note: existing.note, done: true });
  if (existing) clearHabit(h, date);
  else logHabit(h, date, { amount: h.target_amount ?? null });
}

export const byHabitOrder = (a: Habit, b: Habit) =>
  a.position && b.position ? (a.position < b.position ? -1 : 1) : a.position ? -1 : b.position ? 1 : a.created_at.localeCompare(b.created_at);

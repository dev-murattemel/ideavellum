import { subDays } from "date-fns";

import { data } from "@/lib/data/store";
import type { Habit, HabitCheck, Highlight, Resource, TiptapDoc } from "@/lib/data/types";
import { isoDate } from "@/lib/time";
import { amountOf } from "./habits";

/** Alıntılar: sayfa sırasına göre, sayfasızlar en sonda (yeniden eskiye) */
export const byPage = (a: Highlight, b: Highlight) =>
  (a.page ?? Infinity) - (b.page ?? Infinity) || b.created_at.localeCompare(a.created_at);

/** Kaynağa bağlı alışkanlıkların günlük kayıtları: okuma günlüğü */
export function readingLog(resourceId: string, habits: Habit[], checks: HabitCheck[], today: Date) {
  const linked = habits.filter((h) => h.resource_id === resourceId);
  const ids = new Map(linked.map((h) => [h.id, h]));
  const rows = checks
    .filter((c) => ids.has(c.habit_id))
    .map((c) => ({ check: c, habit: ids.get(c.habit_id)!, amount: amountOf(ids.get(c.habit_id)!, c) }))
    .sort((a, b) => b.check.date.localeCompare(a.check.date));
  const since = isoDate(subDays(today, 29));
  const last30 = rows.filter((r) => r.check.date >= since);
  const total30 = last30.reduce((n, r) => n + r.amount, 0);
  const days30 = new Set(last30.map((r) => r.check.date)).size;
  return { linked, rows, total30, days30, avg: days30 ? total30 / days30 : 0, unit: linked[0]?.unit ?? null };
}

const text = (t: string) => (t ? [{ type: "text", text: t }] : undefined);

/** Alıntıları tek nota çevirir: her alıntı bir blok alıntı, altında sayfa ve kişisel not */
function toDoc(r: Resource, items: Highlight[]): TiptapDoc {
  const content = items.flatMap((h) => [
    ...(h.text ? [{ type: "blockquote", content: [{ type: "paragraph", content: text(h.text) }] }] : []),
    { type: "paragraph", content: text([h.page != null ? `s. ${h.page}` : null, h.note].filter(Boolean).join(" · ")) },
  ]);
  const head = [r.author, r.progress_total ? `${r.progress_current ?? 0}/${r.progress_total}` : null].filter(Boolean).join(" · ");
  return { type: "doc", content: [...(head ? [{ type: "paragraph", content: text(head) }] : []), ...content] };
}

/** "Notlara aktar": aynı başlıklı not varsa günceller, yoksa açar */
export function highlightsToNote(r: Resource, items: Highlight[]) {
  const title = `${r.title} · Alıntılar`;
  const doc = toDoc(r, [...items].sort(byPage));
  const existing = Object.values(data().notes).find((n) => n.title === title);
  if (existing) {
    data().update("notes", existing.id, { content: doc });
    return existing.id;
  }
  return data().insert("notes", { course_id: r.course_id, topic_id: r.topic_id, title, content: doc, is_pinned: false, tags: [] }).id;
}

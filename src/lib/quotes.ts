import type { Quote } from "@/lib/data/types";

/** Günün sözü: aynı gün hep aynı söz; favoriler iki kat şansla gelir. */
export function quoteOfDay(quotes: Quote[], isoDay: string): Quote | null {
  if (!quotes.length) return null;
  const pool = [...quotes].sort((a, b) => a.id.localeCompare(b.id)).flatMap((q) => (q.is_favorite ? [q, q] : [q]));
  let h = 0;
  for (const ch of isoDay) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}

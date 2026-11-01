import { TABLE_NAMES, type DataSnapshot } from "./types";

/** Silinen kayıtlar: kimlik → silinme anı (ISO). Birleştirmede silinen kayıt geri gelmesin diye. */
export type Tombstones = Record<string, string>;

type Row = { id: string; updated_at: string };
const KEEP_DAYS = 120;

/** İki taraftaki silme kayıtlarını birleştirir, çok eskileri atar */
export function mergeTombs(a: Tombstones = {}, b: Tombstones = {}): Tombstones {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
  const out: Tombstones = {};
  for (const src of [a, b]) {
    for (const [id, at] of Object.entries(src)) {
      if (at < cutoff) continue;
      if (!out[id] || at > out[id]) out[id] = at;
    }
  }
  return out;
}

/**
 * Kayıt kayıt birleştirme: her kaydın en yeni hâli (updated_at) kalır;
 * silinme anı kaydın son güncellemesinden sonraysa kayıt düşer.
 */
export function mergeSnapshots(a: DataSnapshot, b: DataSnapshot, tombs: Tombstones): DataSnapshot {
  const out = {} as Record<string, Record<string, Row>>;
  for (const t of TABLE_NAMES) {
    const A = (a[t] ?? {}) as unknown as Record<string, Row>;
    const B = (b[t] ?? {}) as unknown as Record<string, Row>;
    const merged: Record<string, Row> = {};
    for (const id of new Set([...Object.keys(A), ...Object.keys(B)])) {
      const ra = A[id];
      const rb = B[id];
      const row = !ra ? rb : !rb ? ra : rb.updated_at > ra.updated_at ? rb : ra;
      const dead = tombs[id];
      if (dead && dead >= row.updated_at) continue;
      merged[id] = row;
    }
    out[t] = merged;
  }
  return out as unknown as DataSnapshot;
}

/** Hızlı karşılaştırma imzası: kimlikler ve son güncelleme anları */
export function signature(d: DataSnapshot) {
  return TABLE_NAMES.map((t) =>
    Object.values((d[t] ?? {}) as unknown as Record<string, Row>)
      .map((r) => `${r.id}@${r.updated_at}`)
      .sort()
      .join(","),
  ).join("|");
}

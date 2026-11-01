import { generateKeyBetween } from "fractional-indexing";

type Positioned = { position: string };

const byPosition = (a: Positioned, b: Positioned) =>
  a.position < b.position ? -1 : a.position > b.position ? 1 : 0;

export function sortByPosition<T extends Positioned>(rows: T[]): T[] {
  return [...rows].sort(byPosition);
}

/** Listenin sonuna eklenecek kaydın sırası */
export function positionAtEnd(rows: Positioned[]): string {
  const sorted = sortByPosition(rows);
  return generateKeyBetween(sorted.at(-1)?.position ?? null, null);
}

export function positionAtStart(rows: Positioned[]): string {
  const sorted = sortByPosition(rows);
  return generateKeyBetween(null, sorted[0]?.position ?? null);
}

/**
 * Bir kaydı sıralı listede `index` konumuna taşırken yeni sırasını hesaplar.
 * `rows` taşınan kaydı içermemeli. Tüm listeyi yeniden numaralamaya gerek kalmaz.
 */
export function positionForIndex(rows: Positioned[], index: number): string {
  const sorted = sortByPosition(rows);
  const before = sorted[index - 1]?.position ?? null;
  const after = sorted[index]?.position ?? null;
  return generateKeyBetween(before, after);
}

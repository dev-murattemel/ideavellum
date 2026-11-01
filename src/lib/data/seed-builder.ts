import { emptySnapshot } from "./store";
import { newId } from "./ids";
import type { DataSnapshot, NewRow, TableName, Tables } from "./types";

/** Örnek veri üretirken kayıtları tek tip doldurmak için küçük yardımcı. */
export function createBuilder(userId: string, now: Date) {
  const snap: DataSnapshot = emptySnapshot();
  const stamp = now.toISOString();
  const add = <K extends TableName>(table: K, values: NewRow<K>, createdAt?: string): Tables[K] => {
    const row = {
      ...values,
      id: values.id ?? newId(),
      user_id: userId,
      created_at: createdAt ?? stamp,
      updated_at: createdAt ?? stamp,
    } as unknown as Tables[K];
    (snap[table] as Record<string, Tables[K]>)[row.id] = row;
    return row;
  };
  return { snap, add };
}

/** Aynı tohumla hep aynı sayıları veren basit rastgele üretici */
export function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

import { generateNKeysBetween } from "fractional-indexing";

import { data } from "@/lib/data/store";
import type { Course } from "@/lib/data/types";

/**
 * Alanı listede başka bir alanın yerine taşır. Liste küçük olduğu için tüm sıra yeniden
 * hesaplanır; sadece sırası değişen kayıtlar kaydedilir.
 */
export function reorderAreas(list: Course[], activeId: string, overId: string) {
  const from = list.findIndex((c) => c.id === activeId);
  const to = list.findIndex((c) => c.id === overId);
  if (from < 0 || to < 0 || from === to) return;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  const keys = generateNKeysBetween(null, null, next.length);
  next.forEach((c, i) => {
    if (c.position !== keys[i]) data().update("courses", c.id, { position: keys[i] });
  });
}

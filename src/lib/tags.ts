import { COURSE_COLOR_KEYS, type CourseColor } from "@/lib/course-colors";

/** Etiket adını sadeleştirir: "  Gramer " → "gramer" */
export const normalizeTag = (t: string) => t.trim().replace(/^#/, "").replace(/\s+/g, " ").toLocaleLowerCase("tr").slice(0, 32);

/** Her etiket hep aynı rengi alır (adından türetilir) */
export function tagColor(tag: string): CourseColor {
  let h = 0;
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COURSE_COLOR_KEYS[h % COURSE_COLOR_KEYS.length];
}

/** Kayıtlardaki etiketleri kullanım sıklığına göre sıralar */
export function tagCounts(rows: { tags?: string[] | null }[]) {
  const map = new Map<string, number>();
  rows.forEach((r) => r.tags?.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
  return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
}

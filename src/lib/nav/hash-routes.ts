/**
 * Önizleme sürümünde sayfa adresleri #işaret olarak tutulur.
 * "/bugun" ↔ "#bugun", "/dersler/abc" ↔ "#ders-abc"
 */
export function pathToHash(path: string) {
  if (path.startsWith("/dersler/")) return `ders-${path.slice("/dersler/".length)}`;
  return path.replace(/^\//, "") || "bugun";
}

export function hashToPath(hash: string) {
  const h = hash.replace(/^#/, "");
  if (!h) return "/bugun";
  if (h.startsWith("ders-")) return `/dersler/${h.slice(5)}`;
  return `/${h}`;
}

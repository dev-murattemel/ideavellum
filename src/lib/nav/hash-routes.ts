/**
 * Önizleme sürümünde sayfa adresleri #işaret olarak tutulur.
 * "/bugun" ↔ "#bugun", "/alanlar/abc" ↔ "#alan-abc"
 */
export function pathToHash(path: string) {
  if (path.startsWith("/alanlar/")) return `alan-${path.slice("/alanlar/".length)}`;
  return path.replace(/^\//, "") || "bugun";
}

export function hashToPath(hash: string) {
  const h = hash.replace(/^#/, "");
  if (!h) return "/bugun";
  if (h.startsWith("alan-")) return `/alanlar/${h.slice(5)}`;
  return `/${h}`;
}

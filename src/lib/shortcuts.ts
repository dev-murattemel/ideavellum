/** Uygulama genelindeki klavye kısayolları (tek tuş ve "g" ile başlayan gezinme). */
export const GO_SHORTCUTS: { key: string; href: string; label: string }[] = [
  { key: "b", href: "/bugun", label: "Bugün" },
  { key: "t", href: "/takvim", label: "Takvim" },
  { key: "p", href: "/pano", label: "Pano" },
  { key: "a", href: "/alanlar", label: "Alanlar" },
  { key: "n", href: "/notlar", label: "Notlar" },
  { key: "g", href: "/gunluk", label: "Günlük" },
  { key: "s", href: "/aforizmalar", label: "Sözler" },
  { key: "h", href: "/aliskanliklar", label: "Alışkanlıklar" },
  { key: "k", href: "/kaynaklar", label: "Kaynaklar" },
  { key: "r", href: "/ilerleme", label: "İlerleme" },
  { key: "m", href: "/mantar-pano", label: "Mantar pano" },
];

export const ACTION_SHORTCUTS: { key: string; label: string }[] = [
  { key: "n", label: "Yeni not" },
  { key: "t", label: "Yeni görev" },
  { key: "a", label: "Yeni ders" },
  { key: "s", label: "Yeni söz" },
  { key: "j", label: "Günlüğe yaz" },
  { key: "f", label: "Odak modu" },
  { key: "m", label: "Yapışkan not as" },
  { key: "/", label: "Ara" },
  { key: "?", label: "Kısayollar" },
];

/** Yazı yazılan bir alandaysa kısayollar çalışmaz */
export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || !!t.closest("[role=dialog],[role=menu],[role=listbox]");
}

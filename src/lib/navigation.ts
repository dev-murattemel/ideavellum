import {
  Archive,
  BookMarked,
  MessagesSquare,
  Compass,
  StickyNote,
  CalendarDays,
  ChartColumn,
  LayoutGrid,
  Library,
  NotebookPen,
  Repeat,
  Settings,
  SquareKanban,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Mobil alt çubuk gibi dar yerlerde kullanılan kısa ad */
  shortLabel?: string;
  icon: LucideIcon;
  description: string;
  /** Bu öğeyi aktif gösteren diğer sayfalar */
  also?: string[];
};

export type NavGroup = { label: string | null; items: NavItem[] };

/** Kenar çubuğundaki gruplar (Notion / Linear benzeri sade bölümler) */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/bugun", label: "Bugün", icon: Sun, description: "Şu an ne var, sırada ne var, bugün ne yapılacak" },
      { href: "/takvim", label: "Takvim", icon: CalendarDays, description: "Haftalık ve aylık program" },
      { href: "/pano", label: "Pano", icon: SquareKanban, description: "Görevler sütunlarda" },
      { href: "/aliskanliklar", label: "Alışkanlıklar", icon: Repeat, description: "Her gün işaretlenen küçük rutinler, seriler" },
      { href: "/alanlar", label: "Alanlar", icon: LayoutGrid, description: "Düzenli zaman ayırdığın her şey: dil, spor, okuma, mutfak, projeler…" },
    ],
  },
  {
    label: "Kütüphane",
    items: [
      { href: "/mantar-pano", label: "Mantar pano", icon: StickyNote, description: "Aklına geleni hızla as, sonra toparla" },
      { href: "/notlar", label: "Notlar", icon: NotebookPen, description: "Etiketli notlar, görseller ve bağlantılar" },
      { href: "/forum", label: "Forum", icon: MessagesSquare, description: "Kategoriler, başlıklar ve yazılar: konu konu yaz, bir arada tut" },
      { href: "/gunluk", label: "Günlük", icon: BookMarked, description: "Her güne bir sayfa, ruh hali ve kendi sözlerin", also: ["/aforizmalar"] },
      { href: "/kaynaklar", label: "Kaynaklar", icon: Library, description: "Video, kitap, makale ve podcast'ler" },
      { href: "/rehber", label: "Rehber", icon: Compass, description: "Tarifler, hareketlerin doğru yapılışı ve çalışma yöntemleri" },
    ],
  },
  {
    label: "İçgörü",
    items: [
      { href: "/ilerleme", label: "İlerleme", icon: ChartColumn, description: "Haftalık ve aylık ilerleme, hedefler" },
      { href: "/arsiv", label: "Arşiv", icon: Archive, description: "Tamamladığın alanlar ve değerlendirmeleri" },
    ],
  },
];

export const MAIN_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const SETTINGS_NAV: NavItem = {
  href: "/ayarlar",
  label: "Ayarlar",
  icon: Settings,
  description: "Profil, zil ve bildirim tercihleri",
};

/** Mobil alt çubukta doğrudan görünenler; kalanı "Daha fazla" altında. */
export const MOBILE_PRIMARY = ["/bugun", "/takvim", "/pano", "/alanlar"];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

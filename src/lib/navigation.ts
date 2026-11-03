import {
  BookMarked,
  Compass,
  CalendarDays,
  ChartColumn,
  LayoutGrid,
  Library,
  NotebookPen,
  GraduationCap,
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
      { href: "/dersler", label: "Müfredat", icon: LayoutGrid, description: "Dönemde takip ettiğin her şey: dil, spor, okuma, mutfak…" },
    ],
  },
  {
    label: "Kütüphane",
    items: [
      { href: "/notlar", label: "Notlar", icon: NotebookPen, description: "Etiketli notlar, görseller ve bağlantılar" },
      { href: "/gunluk", label: "Günlük", icon: BookMarked, description: "Her güne bir sayfa, ruh hali ve kendi sözlerin", also: ["/aforizmalar"] },
      { href: "/kaynaklar", label: "Kaynaklar", icon: Library, description: "Video, kitap, makale ve podcast'ler" },
      { href: "/rehber", label: "Rehber", icon: Compass, description: "Tarifler, hareketlerin doğru yapılışı ve çalışma yöntemleri" },
    ],
  },
  {
    label: "İçgörü",
    items: [
      { href: "/karne", label: "Karne", icon: ChartColumn, description: "Haftalık ve aylık ilerleme, hedefler" },
      { href: "/transkript", label: "Transkript", icon: GraduationCap, description: "Tamamlanan dönemler ve dersler" },
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
export const MOBILE_PRIMARY = ["/bugun", "/takvim", "/pano", "/dersler"];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

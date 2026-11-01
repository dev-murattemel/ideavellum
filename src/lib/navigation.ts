import {
  Archive,
  BookMarked,
  CalendarDays,
  ChartColumn,
  LayoutGrid,
  Library,
  NotebookPen,
  Quote,
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
      { href: "/alanlar", label: "Alanlar", icon: LayoutGrid, description: "Dersler, spor, mutfak, okuma… tüm alanların" },
    ],
  },
  {
    label: "Kütüphane",
    items: [
      { href: "/notlar", label: "Notlar", icon: NotebookPen, description: "Etiketli notlar, görseller ve bağlantılar" },
      { href: "/gunluk", label: "Günlük", icon: BookMarked, description: "Her güne bir sayfa, ruh hali" },
      { href: "/aforizmalar", label: "Aforizmalar", icon: Quote, description: "Kendi sözlerin ve sevdiğin alıntılar" },
      { href: "/kaynaklar", label: "Kaynaklar", icon: Library, description: "Video, kitap, makale ve podcast'ler" },
    ],
  },
  {
    label: "İçgörü",
    items: [
      { href: "/raporlar", label: "Raporlar", icon: ChartColumn, description: "Haftalık ve aylık ilerleme" },
      { href: "/arsiv", label: "Arşiv", icon: Archive, description: "Tamamlanan alanlar ve değerlendirmeleri" },
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

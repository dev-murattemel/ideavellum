import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  GraduationCap,
  Library,
  NotebookPen,
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

export const MAIN_NAV: NavItem[] = [
  { href: "/bugun", label: "Bugün", icon: Sun, description: "Şu anki ders, bugünün programı ve görevleri" },
  { href: "/program", label: "Ders programı", shortLabel: "Program", icon: CalendarDays, description: "Haftalık ders saatleri" },
  { href: "/pano", label: "Pano", icon: SquareKanban, description: "Görevler sütunlarda" },
  { href: "/dersler", label: "Dersler", icon: BookOpen, description: "Dönemin dersleri ve konuları" },
  { href: "/notlar", label: "Notlar", icon: NotebookPen, description: "Tüm derslerin notları" },
  { href: "/kaynaklar", label: "Kaynaklar", icon: Library, description: "Video, kitap, makale ve podcast'ler" },
  { href: "/raporlar", label: "Raporlar", icon: ChartColumn, description: "Haftalık ve aylık ilerleme" },
  { href: "/transkript", label: "Transkript", icon: GraduationCap, description: "Tamamlanan derslerin arşivi" },
];

export const SETTINGS_NAV: NavItem = {
  href: "/ayarlar",
  label: "Ayarlar",
  icon: Settings,
  description: "Profil, zil ve bildirim tercihleri",
};

/** Mobil alt çubukta doğrudan görünenler; kalanı "Daha fazla" altında. */
export const MOBILE_PRIMARY = ["/bugun", "/program", "/pano", "/dersler"];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

import {
  BookOpenText,
  ChefHat,
  Dumbbell,
  FolderKanban,
  GraduationCap,
  MonitorPlay,
  Palette,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { AreaKind } from "@/lib/data/types";

/**
 * Ders türleri. Her tür, arayüzdeki kelimeleri kendine göre seçer:
 * örneğin spor alanında "Ders saati" yerine "Antrenman", "Konular" yerine "Hareketler".
 */
export type AreaKindInfo = {
  key: AreaKind;
  label: string;
  icon: LucideIcon;
  /** Örnek ad (yeni ders formunda) */
  example: string;
  /** Haftalık tekrar eden zaman: "Ders saati", "Antrenman" */
  session: string;
  /** Sıralı alt başlıklar: "Konular", "Hareketler", "Tarifler" */
  topics: string;
  topic: string;
  /** Zamanlayıcı eylemi: "Çalışma", "Antrenman", "İzleme" */
  activity: string;
};

export const AREA_KINDS: AreaKindInfo[] = [
  { key: "course", label: "Öğrenme", icon: GraduationCap, example: "İngilizce B2", session: "Çalışma saati", topics: "Konular", topic: "Konu", activity: "Çalışma" },
  { key: "fitness", label: "Spor", icon: Dumbbell, example: "Haftada 3 koşu", session: "Antrenman", topics: "Hareketler", topic: "Hareket", activity: "Antrenman" },
  { key: "cooking", label: "Mutfak", icon: ChefHat, example: "Akdeniz mutfağı", session: "Mutfak saati", topics: "Tarifler", topic: "Tarif", activity: "Mutfak" },
  { key: "watching", label: "İzleme", icon: MonitorPlay, example: "Tasarım videoları", session: "İzleme saati", topics: "İzleme listesi", topic: "Video", activity: "İzleme" },
  { key: "reading", label: "Okuma", icon: BookOpenText, example: "Lacan okumaları", session: "Okuma saati", topics: "Bölümler", topic: "Bölüm", activity: "Okuma" },
  { key: "spiritual", label: "Maneviyat", icon: Sparkles, example: "Kuran okuma", session: "Vakit", topics: "Bölümler", topic: "Bölüm", activity: "Okuma" },
  { key: "hobby", label: "Hobi", icon: Palette, example: "Piyano", session: "Pratik saati", topics: "Adımlar", topic: "Adım", activity: "Pratik" },
  { key: "project", label: "Proje", icon: FolderKanban, example: "Kişisel web sitesi", session: "Çalışma saati", topics: "Aşamalar", topic: "Aşama", activity: "Çalışma" },
  { key: "other", label: "Diğer", icon: Shapes, example: "Bahçe işleri", session: "Program saati", topics: "Adımlar", topic: "Adım", activity: "Çalışma" },
];

const BY_KEY = Object.fromEntries(AREA_KINDS.map((k) => [k.key, k])) as Record<AreaKind, AreaKindInfo>;

export const AREA_KIND_KEYS = AREA_KINDS.map((k) => k.key) as [AreaKind, ...AreaKind[]];

/** Eski kayıtlarda tür yoksa "Ders" sayılır. */
export const kindOf = (c: { kind?: AreaKind | null } | null | undefined): AreaKindInfo => BY_KEY[c?.kind ?? "course"] ?? BY_KEY.course;

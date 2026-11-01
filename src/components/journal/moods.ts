import { Angry, Annoyed, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";

import type { CourseColor } from "@/lib/course-colors";

export const MOODS: { value: number; label: string; icon: LucideIcon; color: CourseColor }[] = [
  { value: 1, label: "Zor", icon: Angry, color: "rose" },
  { value: 2, label: "Durgun", icon: Annoyed, color: "peach" },
  { value: 3, label: "İdare eder", icon: Meh, color: "butter" },
  { value: 4, label: "İyi", icon: Smile, color: "mint" },
  { value: 5, label: "Harika", icon: Laugh, color: "sky" },
];

export const moodOf = (v: number | null | undefined) => MOODS.find((m) => m.value === v) ?? null;

/** Her gün değişen yazma sorusu */
const PROMPTS = [
  "Bugün seni ne mutlu etti?",
  "Bugün neyi farklı yapardın?",
  "Bugün kendinle ilgili ne öğrendin?",
  "Şu an aklını en çok ne meşgul ediyor?",
  "Bugün kime teşekkür etmek istersin?",
  "Yarın için tek bir niyetin ne olsun?",
  "Bugünün en küçük ama en güzel anı neydi?",
  "Seni bugün ne yordu, ne dinlendirdi?",
  "Bugün hangi cümle aklında kaldı?",
  "Bir hafta sonra bugünden ne hatırlamak istersin?",
];

export function promptFor(isoDay: string) {
  let h = 0;
  for (const ch of isoDay) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PROMPTS[h % PROMPTS.length];
}

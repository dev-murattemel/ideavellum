import { BookOpen, FileText, GraduationCap, Headphones, Link2, PlayCircle, type LucideIcon } from "lucide-react";

import type { ResourceStatus, ResourceType, ResourceUnit } from "@/lib/data/types";

export const RESOURCE_TYPES: { id: ResourceType; label: string; icon: LucideIcon; queued: string }[] = [
  { id: "video", label: "Video", icon: PlayCircle, queued: "İzlenecek" },
  { id: "book", label: "Kitap", icon: BookOpen, queued: "Okunacak" },
  { id: "article", label: "Makale", icon: FileText, queued: "Okunacak" },
  { id: "podcast", label: "Podcast", icon: Headphones, queued: "Dinlenecek" },
  { id: "course", label: "Kurs", icon: GraduationCap, queued: "Başlanacak" },
  { id: "other", label: "Diğer", icon: Link2, queued: "Sırada" },
];
export const TYPE_META = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.id, t])) as Record<ResourceType, (typeof RESOURCE_TYPES)[number]>;

export function statusLabel(status: ResourceStatus, type: ResourceType) {
  if (status === "queued") return TYPE_META[type].queued;
  return status === "in_progress" ? "Devam ediyor" : "Bitti";
}

export const UNIT_LABEL: Record<ResourceUnit, string> = { page: "sayfa", minute: "dakika", chapter: "bölüm" };

export const UNIT_SHORT: Record<ResourceUnit, string> = { page: "sf", minute: "dk", chapter: "bölüm" };

export function defaultUnit(type: ResourceType): ResourceUnit {
  return type === "video" || type === "podcast" ? "minute" : type === "course" ? "chapter" : "page";
}

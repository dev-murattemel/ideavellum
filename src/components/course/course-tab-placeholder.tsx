import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";

export function CourseTabPlaceholder({ icon, title, phase }: { icon: LucideIcon; title: string; phase: string }) {
  return <EmptyState compact icon={icon} title={title} description={`Bu sekme ${phase}'te dolacak.`} />;
}

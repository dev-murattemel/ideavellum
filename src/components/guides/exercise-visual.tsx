import { Accessibility, BicepsFlexed, Dumbbell, Footprints, HeartPulse, PersonStanding, Target, Weight, type LucideIcon } from "lucide-react";

import type { CourseColor } from "@/lib/course-colors";
import { cn } from "@/lib/utils";

const GROUP: Record<string, { icon: LucideIcon; color: CourseColor }> = {
  Göğüs: { icon: Dumbbell, color: "rose" },
  Sırt: { icon: PersonStanding, color: "sky" },
  Bacak: { icon: Footprints, color: "mint" },
  Omuz: { icon: Weight, color: "lavender" },
  Kol: { icon: BicepsFlexed, color: "peach" },
  Karın: { icon: Target, color: "butter" },
  Kardiyo: { icon: HeartPulse, color: "rose" },
  Mobilite: { icon: Accessibility, color: "sage" },
};

export const groupStyle = (g: string) => GROUP[g] ?? { icon: Dumbbell, color: "slate" as CourseColor };

/** Kas grubu simgesi; kartlarda ve ayrıntı panelinde */
export function ExerciseVisual({ group, className, size = "md" }: { group: string; className?: string; size?: "md" | "lg" }) {
  const { icon: Icon, color } = groupStyle(group);
  return (
    <div data-course={color} aria-hidden className={cn("relative overflow-hidden bg-course text-course-fg", className)}>
      <span className="absolute -top-6 -right-6 size-24 rounded-full border-[14px] border-course-solid/15" />
      <span className="absolute inset-0 flex items-center justify-center">
        <Icon className={size === "lg" ? "size-14" : "size-8"} strokeWidth={1.5} />
      </span>
    </div>
  );
}

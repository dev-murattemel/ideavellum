"use client";

import { COURSE_COLORS, type CourseColor } from "@/lib/course-colors";
import { cn } from "@/lib/utils";

/** Not rengi seçici: sarı (klasik) ilk sırada */
export const STICKY_COLORS: CourseColor[] = ["butter", ...COURSE_COLORS.map((c) => c.key).filter((c) => c !== "butter")];

const LABEL: Record<CourseColor, string> = {
  butter: "Sarı", peach: "Turuncu", rose: "Pembe", lavender: "Mor", sky: "Mavi", mint: "Yeşil", sage: "Adaçayı", slate: "Gri",
};

export function StickyColors({ value, onChange, size = "md" }: { value: CourseColor | null; onChange: (c: CourseColor) => void; size?: "sm" | "md" }) {
  return (
    <div role="radiogroup" aria-label="Not rengi" className="flex items-center gap-1">
      {STICKY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={LABEL[c]}
          title={LABEL[c]}
          data-course={c}
          onClick={() => onChange(c)}
          className={cn(
            "cursor-pointer rounded-full bg-course-solid outline-none ring-offset-2 ring-offset-surface transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
            size === "sm" ? "size-4" : "size-5",
            value === c && "ring-2 ring-foreground/70",
          )}
        />
      ))}
    </div>
  );
}

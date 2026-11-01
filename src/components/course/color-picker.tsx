"use client";

import { Check } from "lucide-react";

import { COURSE_COLORS, type CourseColor } from "@/lib/course-colors";
import { cn } from "@/lib/utils";

/** Ders paletinden renk seçici (serbest renk yok; renk bilgi taşır). */
export function ColorPicker({ value, onChange }: { value: CourseColor; onChange: (c: CourseColor) => void }) {
  return (
    <div role="radiogroup" aria-label="Ders rengi" className="flex flex-wrap gap-2">
      {COURSE_COLORS.map((c) => {
        const checked = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={c.label}
            title={c.label}
            data-course={c.key}
            onClick={() => onChange(c.key)}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-lg border-2 bg-course transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              checked ? "border-course-solid" : "border-transparent hover:scale-105",
            )}
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-course-solid">
              {checked && <Check className="size-3 text-white" strokeWidth={3} aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

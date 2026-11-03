"use client";

import type { CourseColor } from "@/lib/course-colors";
import { cn } from "@/lib/utils";

export type Chip = { key: string; label: string; count?: number; color?: CourseColor };

/** Rehberdeki süzgeç çipleri (stil, kas grubu, konu) */
export function FilterChips({ chips, value, onChange, label }: { chips: Chip[]; value: string; onChange: (k: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-1 flex flex-wrap gap-1.5 px-1">
      {chips.map((c) => {
        const on = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.key)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-13 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "border-primary bg-primary text-primary-foreground" : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-foreground",
            )}
          >
            {c.color && <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />}
            {c.label}
            {c.count !== undefined && <span className={cn("tabular text-xs", on ? "opacity-70" : "text-ink-subtle")}>{c.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

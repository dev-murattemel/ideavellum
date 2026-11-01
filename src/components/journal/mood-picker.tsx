"use client";

import { cn } from "@/lib/utils";
import { MOODS } from "./moods";

/** Ruh hali: beş seçenek, tekrar tıklayınca kaldırılır */
export function MoodPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div role="radiogroup" aria-label="Ruh hali" className="flex flex-wrap gap-1.5">
      {MOODS.map((m) => {
        const on = m.value === value;
        const Icon = m.icon;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={on}
            data-course={m.color}
            onClick={() => onChange(on ? null : m.value)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-13 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "border-transparent bg-course text-course-fg" : "border-line text-ink-muted hover:border-line-strong hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", on && "text-course-solid")} strokeWidth={1.9} aria-hidden />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

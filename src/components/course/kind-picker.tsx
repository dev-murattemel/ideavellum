"use client";

import { AREA_KINDS } from "@/lib/area-kinds";
import type { AreaKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Alan türü seçici: ikonlu küçük kutular, klavyeyle radyo grubu gibi çalışır */
export function KindPicker({ value, onChange }: { value: AreaKind; onChange: (v: AreaKind) => void }) {
  return (
    <div role="radiogroup" aria-label="Alan türü" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {AREA_KINDS.map((k) => {
        const Icon = k.icon;
        const on = k.key === value;
        return (
          <button
            key={k.key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k.key)}
            className={cn(
              "flex h-16 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "border-primary bg-accent-soft text-accent-text" : "border-line text-ink-muted hover:border-line-strong hover:text-foreground",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={on ? 2.1 : 1.8} aria-hidden />
            {k.label}
          </button>
        );
      })}
    </div>
  );
}

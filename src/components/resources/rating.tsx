"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({ value, onChange, size = "sm" }: { value: number | null; onChange?: (v: number | null) => void; size?: "sm" | "md" }) {
  const cls = size === "md" ? "size-5" : "size-3.5";
  if (!onChange) {
    if (!value) return null;
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5 puan`}>
        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn(cls, i <= value ? "fill-[var(--butter-solid)] text-[var(--butter-solid)]" : "text-line-strong")} aria-hidden />)}
      </span>
    );
  }
  return (
    <div role="radiogroup" aria-label="Puan" className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} puan`}
          onClick={() => onChange(value === i ? null : i)}
          className="cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star className={cn(cls, value && i <= value ? "fill-[var(--butter-solid)] text-[var(--butter-solid)]" : "text-line-strong hover:text-[var(--butter-solid)]")} />
        </button>
      ))}
    </div>
  );
}

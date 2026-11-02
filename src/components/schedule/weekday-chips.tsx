"use client";

import { WEEKDAY_NAMES, WEEKDAY_SHORT } from "@/lib/time";
import { cn } from "@/lib/utils";

const WEEKDAYS = [1, 2, 3, 4, 5];
const ALL = [1, 2, 3, 4, 5, 6, 7];
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

/** Haftanın günlerinden birden fazlasını seçme; "Hafta içi" ve "Her gün" kısayollarıyla */
export function WeekdayChips({ value, onChange, locked, label = "Günler" }: {
  value: number[];
  onChange: (v: number[]) => void;
  /** Seçimden çıkarılamayan gün (ör. kopyalanan saatin kendi günü) */
  locked?: number;
  label?: string;
}) {
  const toggle = (d: number) => {
    if (d === locked) return;
    const next = value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort();
    if (next.length) onChange(next);
  };
  const preset = (days: number[]) => onChange(locked && !days.includes(locked) ? [...days, locked].sort() : days);

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={label} className="grid grid-cols-7 gap-1">
        {ALL.map((d) => {
          const on = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={WEEKDAY_NAMES[d - 1]}
              disabled={d === locked}
              onClick={() => toggle(d)}
              className={cn(
                "h-9 cursor-pointer rounded-md border text-13 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
                on ? "border-primary bg-primary text-primary-foreground" : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-foreground",
                d === locked && "opacity-60",
              )}
            >
              {WEEKDAY_SHORT[d - 1]}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1">
        {[
          { days: WEEKDAYS, text: "Hafta içi" },
          { days: [6, 7], text: "Hafta sonu" },
          { days: ALL, text: "Her gün" },
        ].map((p) => (
          <button
            key={p.text}
            type="button"
            onClick={() => preset(p.days)}
            aria-pressed={same(value, p.days)}
            className={cn(
              "h-7 cursor-pointer rounded-md px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              same(value, p.days) ? "bg-accent-soft text-foreground" : "text-ink-muted hover:bg-hover hover:text-foreground",
            )}
          >
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
}

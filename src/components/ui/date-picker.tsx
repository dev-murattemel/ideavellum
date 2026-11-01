"use client";

import * as React from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fmt, isoDate, parseDay, WEEKDAY_SHORT } from "@/lib/time";
import { cn } from "@/lib/utils";

type Props = {
  /** yyyy-MM-dd ya da boş */
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Türkçe tarih seçici: tetikleyici "4 Kasım 2026, Çarşamba" gösterir,
 * açılan takvim Pazartesi'den başlar. Ok tuşlarıyla gün, PageUp/PageDown ile ay değişir.
 */
export function DatePicker({ value, onChange, id, placeholder = "Tarih seç", min, max, clearable = true, invalid, className, ...rest }: Props) {
  const [open, setOpen] = React.useState(false);
  const today = isoDate(new Date());
  const [focus, setFocus] = React.useState(value || today);
  const [month, setMonth] = React.useState(() => startOfMonth(parseDay(value || today)));
  const gridRef = React.useRef<HTMLDivElement>(null);

  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const blocked = (d: string) => (!!min && d < min) || (!!max && d > max);

  const openChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      const start = value || today;
      setFocus(start);
      setMonth(startOfMonth(parseDay(start)));
    }
  };
  const pick = (d: string) => {
    if (blocked(d)) return;
    onChange(d);
    setOpen(false);
  };
  const moveFocus = (next: Date) => {
    const key = isoDate(next);
    setFocus(key);
    if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus());
  };
  const onKey = (e: React.KeyboardEvent) => {
    const f = parseDay(focus);
    const map: Record<string, Date> = {
      ArrowLeft: addDays(f, -1), ArrowRight: addDays(f, 1), ArrowUp: addDays(f, -7), ArrowDown: addDays(f, 7),
      PageUp: addMonths(f, -1), PageDown: addMonths(f, 1), Home: startOfWeek(f, { weekStartsOn: 1 }), End: endOfWeek(f, { weekStartsOn: 1 }),
    };
    if (map[e.key]) {
      e.preventDefault();
      moveFocus(map[e.key]);
    }
  };

  return (
    <Popover open={open} onOpenChange={openChange}>
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-label={rest["aria-label"]}
            data-invalid={invalid || undefined}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-surface pr-8 pl-3 text-left text-sm transition-colors outline-none hover:border-line-strong focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 data-[invalid]:border-destructive data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/15",
              !value && "text-ink-subtle",
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-ink-subtle" aria-hidden />
            <span className="truncate">{value ? fmt(parseDay(value), "d MMMM yyyy, EEE") : placeholder}</span>
          </button>
        </PopoverTrigger>
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Tarihi temizle"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink-subtle hover:bg-hover hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent align="start" className="w-[296px] p-3" onOpenAutoFocus={(e) => { e.preventDefault(); requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus()); }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="pl-1 text-sm font-semibold capitalize">{fmt(month, "MMMM yyyy")}</span>
          <div className="flex gap-0.5">
            <NavBtn label="Önceki ay" onClick={() => setMonth((m) => addMonths(m, -1))}><ChevronLeft className="size-4" /></NavBtn>
            <NavBtn label="Sonraki ay" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="size-4" /></NavBtn>
          </div>
        </div>
        <div ref={gridRef} role="grid" aria-label={fmt(month, "MMMM yyyy")} onKeyDown={onKey} className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAY_SHORT.map((d) => <span key={d} className="pb-1 text-[11px] font-medium text-ink-subtle">{d.slice(0, 2)}</span>)}
          {days.map((d) => {
            const key = isoDate(d);
            const sel = key === value;
            const off = blocked(key);
            return (
              <button
                key={key}
                type="button"
                data-day={key}
                tabIndex={key === focus ? 0 : -1}
                disabled={off}
                aria-pressed={sel}
                aria-current={key === today ? "date" : undefined}
                aria-label={fmt(d, "d MMMM yyyy, EEEE")}
                onClick={() => pick(key)}
                className={cn(
                  "tabular flex size-9 cursor-pointer items-center justify-center rounded-lg text-13 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30",
                  !isSameMonth(d, month) && "text-ink-subtle/70",
                  sel ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-hover",
                  key === today && !sel && "font-semibold text-accent-text ring-1 ring-primary/30 ring-inset",
                )}
              >
                {fmt(d, "d")}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <div className="flex gap-1">
            <Quick label="Bugün" disabled={blocked(today)} onClick={() => pick(today)} />
            <Quick label="Yarın" disabled={blocked(isoDate(addDays(new Date(), 1)))} onClick={() => pick(isoDate(addDays(new Date(), 1)))} />
          </div>
          {clearable && value && <Quick label="Temizle" onClick={() => { onChange(""); setOpen(false); }} />}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NavBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover hover:text-foreground">
      {children}
    </button>
  );
}

function Quick({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="h-7 cursor-pointer rounded-md px-2 text-13 font-medium text-accent-text hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-40">
      {label}
    </button>
  );
}

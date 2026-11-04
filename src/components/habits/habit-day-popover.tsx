"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { BookOpen, Check, Minus, Plus, Quote, Target, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useRow } from "@/lib/data/hooks";
import type { Habit, HabitCheck } from "@/lib/data/types";
import { data } from "@/lib/data/store";
import { clearHabit, fmtAmount, hasTarget, logHabit, parseTarget } from "@/lib/domain/habits";
import { fmt } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Hedefin çeyrekleri: 2 litre → 0,5 · 1 · 1,5 · 2 */
function quickAmounts(target: number) {
  const step = target >= 8 ? 1 : 0.25;
  return [0.25, 0.5, 0.75, 1].map((f) => Math.max(step, Math.round((target * f) / step) * step)).filter((v, i, a) => a.indexOf(v) === i);
}

const parse = (s: string) => {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/**
 * Bir günün kaydı: miktar (1,5 / 2 litre), o güne not ve bağlı kitaba alıntı.
 * Miktarlı alışkanlıkta güne dokununca açılır.
 */
export function HabitDayPopover({ habit, date, check, children, align = "center", open: controlled, onOpenChange }: {
  habit: Habit;
  date: string;
  check?: HabitCheck;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  /** Verilirse pencere dışarıdan açılır; içerik yalnızca konum için kullanılır (tıklama kendi işini yapar) */
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [own, setOwn] = React.useState(false);
  const open = controlled ?? own;
  const setOpen = onOpenChange ?? setOwn;
  const Wrap = controlled === undefined ? PopoverTrigger : PopoverAnchor;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Wrap asChild>{children}</Wrap>
      <PopoverContent align={align} className="w-80 p-0" data-course={habit.color}>
        {open && <DayForm habit={habit} date={date} check={check} onDone={() => setOpen(false)} />}
      </PopoverContent>
    </Popover>
  );
}

function DayForm({ habit, date, check, onDone }: { habit: Habit; date: string; check?: HabitCheck; onDone: () => void }) {
  const target = habit.target_amount ?? 0;
  const withTarget = hasTarget(habit);
  const resource = useRow("resources", habit.resource_id ?? undefined);
  const [text, setText] = React.useState(fmtAmount(check ? (check.amount ?? target) : target));
  const [note, setNote] = React.useState(check?.note ?? "");
  // Miktarsız alışkanlık: güne dokunmak çoğunlukla "yaptım" demektir; not tek başına da saklanabilir
  const [done, setDone] = React.useState(check ? check.amount !== 0 : true);
  const suggested = withTarget ? null : parseTarget(habit.name);
  const amount = parse(text);
  const step = target >= 8 ? 1 : 0.25;
  const pct = withTarget && amount != null ? Math.min(100, (amount / target) * 100) : 0;

  const save = () => {
    if (withTarget && amount == null) return;
    logHabit(habit, date, { amount, note, done });
    onDone();
  };
  const useSuggested = () => {
    if (!suggested) return;
    data().update("habits", habit.id, { target_amount: suggested.amount, unit: suggested.unit });
    setText(fmtAmount(check && check.amount !== 0 ? suggested.amount : 0));
  };
  const bump = (d: number) => setText(fmtAmount(Math.max(0, Math.round(((amount ?? 0) + d) * 100) / 100)));

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex flex-col">
      <div className="flex flex-col gap-0.5 border-b border-line px-4 pt-3 pb-2.5">
        <p className="text-sm font-semibold">{habit.name}</p>
        <p className="text-xs text-ink-muted first-letter:uppercase">{fmt(parseISO(date), "d MMMM, EEEE")}</p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {!withTarget && (
          <div role="radiogroup" aria-label="Bu gün" className="grid grid-cols-2 gap-1.5">
            {[
              { v: true, label: "Yaptım", Icon: Check },
              { v: false, label: "Yapmadım", Icon: X },
            ].map(({ v, label, Icon }) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={done === v}
                onClick={() => setDone(v)}
                className={cn(
                  "flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border text-13 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  done === v ? (v ? "border-transparent bg-course-solid text-white" : "border-foreground/40 bg-sunken text-foreground") : "border-line text-ink-muted hover:border-line-strong",
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        )}
        {suggested && (
          <button
            type="button"
            onClick={useSuggested}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-left text-13 transition-colors hover:bg-hover/60"
          >
            <Target className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="font-medium">Günlük hedef yap: {fmtAmount(suggested.amount)} {suggested.unit}</span>
              <span className="block text-xs text-ink-muted">Böylece {fmtAmount(suggested.amount * 0.75)} {suggested.unit} gibi kısmi günleri de yazarsın.</span>
            </span>
          </button>
        )}
        {withTarget && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="icon-sm" aria-label="Azalt" onClick={() => bump(-step)}><Minus /></Button>
              <label className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-input bg-surface px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <input
                  autoFocus
                  inputMode="decimal"
                  aria-label={`Miktar (${habit.unit ?? "adet"})`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="tabular w-full min-w-0 bg-transparent text-right text-base font-semibold outline-none"
                />
                <span className="shrink-0 text-13 text-ink-muted">/ {fmtAmount(target)} {habit.unit}</span>
              </label>
              <Button type="button" variant="secondary" size="icon-sm" aria-label="Artır" onClick={() => bump(step)}><Plus /></Button>
            </div>
            <Progress value={pct} tone="course" label="Günlük hedef" />
            <div className="flex gap-1.5">
              {quickAmounts(target).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setText(fmtAmount(v))}
                  className={cn(
                    "tabular h-7 flex-1 cursor-pointer rounded-md border text-xs font-medium transition-colors",
                    amount === v ? "border-transparent bg-course-solid text-white" : "border-line text-ink-muted hover:border-line-strong hover:text-foreground",
                  )}
                >
                  {fmtAmount(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-13 font-medium">Not</span>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="field-sizing-content min-h-16 text-13"
            placeholder={resource ? "Bugün hangi bölümü okudun, ne düşündün?" : "Nasıl geçti? Ör. akşam yetiştiremedim"}
          />
        </label>

        {resource && (
          <div className="flex items-center gap-2 rounded-lg bg-sunken px-3 py-2">
            <BookOpen className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <button type="button" onClick={() => { onDone(); ui().openResource(resource.id); }} className="min-w-0 flex-1 cursor-pointer text-left outline-none">
              <span className="block truncate text-13 font-medium hover:underline">{resource.title}</span>
              {resource.progress_total ? <span className="tabular block text-xs text-ink-muted">Sayfa {resource.progress_current ?? 0}/{resource.progress_total}</span> : null}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (withTarget && amount != null) logHabit(habit, date, { amount, note });
                onDone();
                ui().open({ type: "highlight", resourceId: resource.id, page: resource.progress_current ?? undefined });
              }}
            >
              <Quote /> Alıntı ekle
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        {check ? (
          <Button type="button" variant="ghost" size="sm" className="text-ink-muted" onClick={() => { clearHabit(habit, date); onDone(); }}>Kaydı sil</Button>
        ) : <span />}
        <Button type="submit" size="sm" disabled={withTarget && amount == null}>Kaydet</Button>
      </div>
    </form>
  );
}

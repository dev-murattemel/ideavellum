"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { UNITS } from "@/lib/catalog";
import type { EntryCheck } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const parse = (v: string) => {
  const n = Number(v.replace(",", ".").trim());
  return v.trim() === "" || Number.isNaN(n) ? null : Math.max(0, n);
};
const show = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n).replace(".", ","));

/** Küçük sayı kutusu: sağında birimi yazar ("set", "kg"); odaktan çıkınca ya da Enter'da kaydeder */
function NumberBox({ value, suffix, label, width, onCommit }: { value: number | null | undefined; suffix: string; label: string; width: string; onCommit: (n: number | null) => void }) {
  const [draft, setDraft] = React.useState(show(value));
  const [prev, setPrev] = React.useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(show(value));
  }
  const commit = () => {
    const n = parse(draft);
    if (n !== (value ?? null)) onCommit(n);
    else setDraft(show(value));
  };
  return (
    <label className={cn("flex h-8 shrink-0 items-center gap-1 rounded-md border border-line bg-surface px-2 transition-colors focus-within:border-ring hover:border-line-strong", width)}>
      <input
        inputMode="decimal"
        aria-label={label}
        value={draft}
        placeholder="–"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        onFocus={(e) => e.currentTarget.select()}
        className="tabular w-full min-w-0 bg-transparent text-right text-13 font-medium outline-none placeholder:text-ink-subtle"
      />
      <span className="shrink-0 text-xs text-ink-subtle">{suffix}</span>
    </label>
  );
}

/** Maddenin ölçü kutuları: kuvvet → set/tekrar/kg, kardiyo → dk/km, miktar → sayı + birim */
export function MeasureFields({ c, onChange }: { c: EntryCheck; onChange: (p: Partial<EntryCheck>) => void }) {
  const name = c.label;
  switch (c.metric) {
    case "strength":
      return (
        <>
          <NumberBox value={c.sets} suffix="set" label={`${name} set`} width="w-[68px]" onCommit={(sets) => onChange({ sets })} />
          <NumberBox value={c.reps} suffix="tkr" label={`${name} tekrar`} width="w-[68px]" onCommit={(reps) => onChange({ reps })} />
          <NumberBox value={c.weight} suffix="kg" label={`${name} ağırlık (kg)`} width="w-[68px]" onCommit={(weight) => onChange({ weight })} />
        </>
      );
    case "cardio":
      return (
        <>
          <NumberBox value={c.minutes} suffix="dk" label={`${name} süre (dakika)`} width="w-[68px]" onCommit={(minutes) => onChange({ minutes })} />
          <NumberBox value={c.km} suffix="km" label={`${name} mesafe (km)`} width="w-[68px]" onCommit={(km) => onChange({ km })} />
        </>
      );
    case "amount":
      return (
        <>
          <NumberBox value={c.amount} suffix="" label={`${name} miktar`} width="w-[60px]" onCommit={(amount) => onChange({ amount })} />
          <span className="relative shrink-0">
            <select
              aria-label={`${name} birim`}
              value={c.unit ?? ""}
              onChange={(e) => onChange({ unit: e.target.value || null })}
              className="h-8 w-[118px] cursor-pointer appearance-none truncate rounded-md border border-line bg-surface pr-6 pl-2 text-13 outline-none hover:border-line-strong focus-visible:border-ring"
            >
              <option value="">birim</option>
              {[...new Set([...(c.unit ? [c.unit] : []), ...UNITS])].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-ink-subtle" aria-hidden />
          </span>
        </>
      );
    default:
      return null;
  }
}

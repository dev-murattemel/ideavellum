"use client";

import { CalendarPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { minutesToTime, timeToMinutes, WEEKDAY_NAMES } from "@/lib/time";

export type Slot = { weekday: number; start: string; end: string };

export const slotError = (slots: Slot[]) =>
  slots.some((s) => timeToMinutes(s.end) <= timeToMinutes(s.start)) ? "Her saatte bitiş, başlangıçtan sonra olmalı." : null;

/** Yeni ders oluştururken haftalık ders saatlerini girme alanı */
export function SlotFields({ label = "Haftalık program", value, onChange, error }: { label?: string; value: Slot[]; onChange: (v: Slot[]) => void; error?: string | null }) {
  const set = (i: number, patch: Partial<Slot>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => {
    const last = value.at(-1);
    onChange([...value, last ? { ...last, weekday: (last.weekday % 7) + 1 } : { weekday: 2, start: "19:00", end: "20:30" }]);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-13 font-medium">{label}</legend>
      {value.length === 0 && (
        <p className="text-13 text-ink-muted">Her hafta tekrar eden saatleri ekle; takvimde ve Bugün ekranında görünür.</p>
      )}
      {value.map((s, i) => (
        <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-2">
          <Select value={String(s.weekday)} onValueChange={(v) => set(i, { weekday: Number(v) })}>
            <SelectTrigger aria-label={`${i + 1}. saatin günü`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {WEEKDAY_NAMES.map((n, d) => <SelectItem key={n} value={String(d + 1)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <TimeSelect
            label={`${i + 1}. saatin başlangıcı`}
            value={s.start}
            to={23 * 60 + 45}
            onChange={(v) => {
              const dur = Math.max(15, timeToMinutes(s.end) - timeToMinutes(s.start));
              set(i, { start: v, end: minutesToTime(Math.min(24 * 60, timeToMinutes(v) + dur)) });
            }}
          />
          <TimeSelect label={`${i + 1}. saatin bitişi`} value={s.end} onChange={(v) => set(i, { end: v })} />
          <Button type="button" variant="ghost" size="icon" aria-label={`${i + 1}. saati kaldır`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X />
          </Button>
        </div>
      ))}
      {error && <p role="alert" className="text-13 text-destructive">{error}</p>}
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={add}>
        <CalendarPlus /> {value.length ? "Bir saat daha ekle" : "Saat ekle"}
      </Button>
    </fieldset>
  );
}

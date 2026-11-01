"use client";

import { X } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, isoDate, minutesToTime, utcToWall, wallToUtc } from "@/lib/time";

const NO_TIME = "23:59";

export function splitDue(due_at: string | null) {
  if (!due_at) return { date: "", time: NO_TIME };
  const d = utcToWall(due_at);
  return { date: isoDate(d), time: fmt(d, "HH:mm") };
}

export function joinDue(date: string, time: string) {
  return date ? wallToUtc(date, time || NO_TIME).toISOString() : null;
}

const TIMES = Array.from({ length: (23 * 60 - 6 * 60) / 30 + 1 }, (_, i) => minutesToTime(6 * 60 + i * 30));

/** Son tarih: gün + isteğe bağlı saat (24 saat) */
export function DueFields({ date, time, onChange, idPrefix = "due" }: { date: string; time: string; onChange: (date: string, time: string) => void; idPrefix?: string }) {
  const times = TIMES.includes(time) || time === NO_TIME ? TIMES : [...TIMES, time].sort();
  return (
    <div className="flex items-center gap-2">
      <DatePicker id={`${idPrefix}-date`} value={date} onChange={(d) => onChange(d, d ? time : NO_TIME)} aria-label="Son tarih" placeholder="Son tarih yok" clearable={false} className="min-w-0 flex-1" />
      <Select value={time} onValueChange={(t) => onChange(date || isoDate(new Date()), t)} disabled={!date}>
        <SelectTrigger className="tabular w-32" aria-label="Saat"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-64">
          <SelectItem value={NO_TIME}>Saat yok</SelectItem>
          {times.map((t) => <SelectItem key={t} value={t} className="tabular">{t}</SelectItem>)}
        </SelectContent>
      </Select>
      {date && (
        <button type="button" onClick={() => onChange("", NO_TIME)} aria-label="Son tarihi kaldır" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle hover:bg-hover hover:text-foreground">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

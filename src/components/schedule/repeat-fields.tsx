"use client";

import { parseISO } from "date-fns";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SessionRepeat } from "@/lib/data/types";
import { repeatLabel } from "@/lib/domain/schedule";
import { isoWeekday, WEEKDAY_NAMES } from "@/lib/time";

const OPTIONS: { value: SessionRepeat; label: string }[] = [
  { value: "weekly", label: "Her hafta" },
  { value: "biweekly", label: "2 haftada bir" },
  { value: "monthly", label: "Her ay" },
  { value: "once", label: "Tek seferlik" },
];

/**
 * Tekrar kuralı. Haftalık dışındaki seçeneklerde bir tarih seçilir ve gün o tarihten gelir.
 * Örnek: "Her ay" + 3 Kasım Salı → her ayın ilk Salısı.
 */
export function RepeatFields({
  repeat,
  anchor,
  onChange,
}: {
  repeat: SessionRepeat;
  anchor: string;
  onChange: (v: { repeat: SessionRepeat; anchor: string; weekday?: number }) => void;
}) {
  const weekday = anchor ? isoWeekday(parseISO(anchor)) : 1;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Tekrar">
        <Select value={repeat} onValueChange={(v) => onChange({ repeat: v as SessionRepeat, anchor, weekday: v === "weekly" ? undefined : weekday })}>
          <SelectTrigger aria-label="Tekrar"><SelectValue /></SelectTrigger>
          <SelectContent>{OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      {repeat !== "weekly" && (
        <Field
          label={repeat === "once" ? "Tarih" : "İlk tarih"}
          htmlFor="s-anchor"
          hint={anchor ? repeatLabel({ repeat, anchor_date: anchor, weekday }, WEEKDAY_NAMES) : undefined}
        >
          <Input
            id="s-anchor"
            type="date"
            value={anchor}
            required
            onChange={(e) => e.target.value && onChange({ repeat, anchor: e.target.value, weekday: isoWeekday(parseISO(e.target.value)) })}
          />
        </Field>
      )}
    </div>
  );
}

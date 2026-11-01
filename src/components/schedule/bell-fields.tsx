"use client";

import { Bell } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BellOverrides, BellSettings } from "@/lib/data/types";

export type BellValue = BellOverrides;

/** Ders saatine özel zil ayarları; boş bırakılan alan genel ayarı kullanır. */
export function BellFields({ value, onChange, defaults }: { value: BellValue; onChange: (v: BellValue) => void; defaults: BellSettings }) {
  const before = value.before_minutes === undefined ? "default" : value.before_minutes === null ? "off" : String(value.before_minutes);
  return (
    <fieldset className="flex flex-col gap-3 rounded-lg bg-sunken p-3">
      <legend className="sr-only">Zil ayarları</legend>
      <div className="flex items-center gap-2 text-13 font-medium">
        <Bell className="size-4 text-ink-muted" aria-hidden /> Zil
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-13 text-ink-muted">Başlamadan önce uyarı</span>
        <Select
          value={before}
          onValueChange={(v) => onChange({ ...value, before_minutes: v === "default" ? undefined : v === "off" ? null : Number(v) })}
        >
          <SelectTrigger size="sm" className="w-40" aria-label="Başlamadan önce uyarı"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Varsayılan ({defaults.before_minutes} dk)</SelectItem>
            <SelectItem value="off">Kapalı</SelectItem>
            {[5, 10, 15, 30].map((m) => <SelectItem key={m} value={String(m)}>{m} dk önce</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {(["start_bell", "end_bell"] as const).map((k) => (
        <label key={k} className="flex cursor-pointer items-center justify-between gap-4">
          <span className="text-13 text-ink-muted">{k === "start_bell" ? "Başlangıç zili" : "Bitiş zili"}</span>
          <Switch
            checked={value[k] ?? defaults[k]}
            onCheckedChange={(c) => onChange({ ...value, [k]: c })}
            aria-label={k === "start_bell" ? "Başlangıç zili" : "Bitiş zili"}
          />
        </label>
      ))}
    </fieldset>
  );
}

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { minutesToTime } from "@/lib/time";

/** Her zaman 24 saat biçiminde, 15 dakikalık adımlarla saat seçici. */
export function TimeSelect({
  value,
  onChange,
  label,
  from = 6 * 60,
  to = 24 * 60,
  step = 15,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  from?: number;
  to?: number;
  step?: number;
}) {
  const options: string[] = [];
  for (let m = from; m <= to; m += step) options.push(minutesToTime(m));
  if (!options.includes(value)) options.unshift(value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="tabular">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((t) => (
          <SelectItem key={t} value={t} className="tabular">
            {t === "24:00" ? "24:00 (gece yarısı)" : t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

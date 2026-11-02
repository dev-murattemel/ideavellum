"use client";

import { useNow } from "@/components/schedule/use-now";
import { fmt } from "@/lib/time";

/** Masaüstü üst çubuğunun solunda bugünün tarihi: "Pazartesi, 2 Kasım 2026" */
export function TodayLabel() {
  const day = useNow(60_000);
  return (
    <p className="hidden min-w-0 truncate text-sm text-ink-muted md:block">
      <span className="font-medium text-foreground">{fmt(day, "EEEE")}</span>, {fmt(day, "d MMMM yyyy")}
    </p>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fmt, formatDuration } from "@/lib/time";

type Day = { date: Date; key: string; minutes: number };

/** Günlük toplam çalışma süresi: tek seri, tek renk (vurgu rengi) */
export function DailyChart({ days }: { days: Day[] }) {
  const data = days.map((d) => ({ ...d, label: days.length > 7 ? fmt(d.date, "d") : fmt(d.date, "EEE") }));
  const max = Math.max(60, ...days.map((d) => d.minutes));
  const ticks = [0, Math.round(max / 2 / 30) * 30, Math.ceil(max / 30) * 30];
  return (
    <div className="h-56 w-full" role="img" aria-label={`Günlük çalışma süresi: ${days.map((d) => `${fmt(d.date, "d MMM")} ${d.minutes} dk`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap={days.length > 7 ? "25%" : "35%"}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeWidth={1} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} interval={days.length > 7 ? 2 : 0} />
          <YAxis ticks={ticks} domain={[0, ticks[2]]} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} tickFormatter={(v: number) => (v >= 60 ? `${(Math.round((v / 60) * 10) / 10).toLocaleString("tr-TR")} sa` : `${v} dk`)} width={52} />
          <Tooltip
            cursor={{ fill: "var(--surface-hover)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Day;
              return (
                <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
                  <p className="font-medium">{fmt(d.date, "d MMMM, EEEE")}</p>
                  <p className="tabular text-ink-muted">{d.minutes ? formatDuration(d.minutes) : "Çalışma yok"}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import * as React from "react";
import { CalendarClock, CircleCheck, CircleX, Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRows } from "@/lib/data/hooks";
import { change, weekCompare } from "@/lib/domain/schedule-stats";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useNow } from "./use-now";

/** Takvimin üstündeki üç özet kartı: planlanan süre, katılım, kaçırılan — geçen haftaya göre */
export function ScheduleStats({ days, filter }: { days: Date[]; filter: string | null }) {
  const sessions = useRows("class_sessions");
  const courses = useRows("courses");
  const attendance = useRows("attendance");
  const now = useNow(60_000);
  const { current: c, previous: p } = React.useMemo(() => {
    const map = Object.fromEntries(courses.map((x) => [x.id, x]));
    const shown = filter ? sessions.filter((s) => s.course_id === filter) : sessions;
    return weekCompare(shown, map, attendance, days, now);
  }, [sessions, courses, attendance, days, now, filter]);

  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 [&>*]:min-w-[240px] [&>*]:snap-start sm:[&>*]:min-w-0">
      <Stat
        icon={CalendarClock}
        title="Planlanan süre"
        hint="Takvimdeki saatlerin toplamı"
        value={formatDuration(c.planned)}
        sub={`${c.count} ders saati`}
        delta={change(c.planned, p.planned)}
        unit="%"
      />
      <Stat
        icon={CircleCheck}
        title="Katılım"
        hint="Geçmiş saatlerden katıldıklarının oranı (yoklamaya göre)"
        value={c.rate === null ? "–" : `%${c.rate}`}
        sub={c.pending ? `${c.pending} saatin yoklaması bekliyor` : "Tüm yoklamalar girildi"}
        delta={c.rate !== null && p.rate !== null ? c.rate - p.rate : null}
        unit=" puan"
      />
      <Stat
        icon={CircleX}
        title="Kaçırılan"
        hint="Yoklamada “Kaçırdım” işaretlenen saatler"
        value={String(c.missed)}
        sub={c.missed ? "Telafi için takvimde boş bir yer seç" : "Bu hafta kaçırılan yok"}
        delta={c.missed - p.missed || (p.missed ? 0 : null)}
        unit=""
        lowerIsBetter
      />
    </div>
  );
}

function Stat({ icon: Icon, title, hint, value, sub, delta, unit, lowerIsBetter = false }: {
  icon: React.ElementType;
  title: string;
  hint: string;
  value: string;
  sub: string;
  delta: number | null;
  unit: string;
  lowerIsBetter?: boolean;
}) {
  const good = delta !== null && (lowerIsBetter ? delta < 0 : delta > 0);
  const bad = delta !== null && (lowerIsBetter ? delta > 0 : delta < 0);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-1.5 text-13 font-medium">
        <Icon className="size-4 text-ink-subtle" aria-hidden />
        {title}
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={hint} className="cursor-help rounded-full text-ink-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Info className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-2">
        <p className="tabular text-[28px] leading-8 font-semibold whitespace-nowrap tracking-[-0.02em]">{value}</p>
        {delta !== null ? (
          <p className="flex items-center gap-1.5 text-xs whitespace-nowrap text-ink-muted">
            <span
              data-course={good ? "mint" : bad ? "rose" : "slate"}
              className={cn("tabular rounded-md bg-course px-1.5 py-0.5 font-semibold text-course-fg")}
            >
              {delta > 0 ? "+" : ""}{delta}{unit}
            </span>
            geçen haftaya göre
          </p>
        ) : (
          <p className="text-xs leading-5 text-ink-subtle">Geçen haftayla karşılaştırma yok</p>
        )}
      </div>
      <p className="truncate border-t border-line pt-3 text-xs text-ink-muted">{sub}</p>
    </div>
  );
}

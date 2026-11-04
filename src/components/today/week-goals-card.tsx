"use client";

import { SectionCard } from "@/components/today/section-card";
import { kindOf } from "@/lib/area-kinds";
import { useProfile, useRows } from "@/lib/data/hooks";
import { areaWeeks } from "@/lib/domain/insights";
import { AppLink } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";

/** Bu hafta her derste ne kadar zaman ayrıldı, hedefe göre */
export function WeekGoalsCard({ now }: { now: Date }) {
  const tz = useProfile().timezone;
  const rows = areaWeeks(useRows("courses"), useRows("study_logs"), now, tz);
  const total = rows.reduce((s, r) => s + r.minutes, 0);
  const target = rows.reduce((s, r) => s + r.target, 0);

  return (
    <SectionCard title="Bu hafta" meta={target ? `${formatDuration(total)} / ${formatDuration(target)}` : formatDuration(total)}>
      {rows.length === 0 ? (
        <p className="text-13 text-ink-muted">Aktif alan yok.</p>
      ) : (
        <ul className="stagger flex flex-col gap-2.5">
          {[...rows].sort((a, b) => (a.target ? a.pct : 999) - (b.target ? b.pct : 999)).slice(0, 5).map(({ course, minutes, target: t, pct }) => {
            const Icon = kindOf(course).icon;
            return (
              <li key={course.id} data-course={course.color}>
                <AppLink href={`/alanlar/${course.id}`} className="group flex flex-col gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center gap-2 text-13">
                    <Icon className="size-3.5 shrink-0 text-course-solid" strokeWidth={2.2} aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-medium group-hover:underline">{course.name}</span>
                    <span className="tabular shrink-0 text-ink-muted">{formatDuration(minutes)}{t ? ` / ${formatDuration(t)}` : ""}</span>
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.name} haftalık hedef`}>
                    <span className="block h-full rounded-full bg-course-solid transition-[width]" style={{ width: `${t ? pct : minutes ? 100 : 0}%`, opacity: t ? 1 : 0.35 }} />
                  </span>
                </AppLink>
              </li>
            );
          })}
        </ul>
      )}
      {rows.length > 5 && (
        <AppLink href="/ilerleme" className="mt-3 text-13 text-ink-muted hover:text-foreground">Tüm alanlar ({rows.length}) İlerleme’de →</AppLink>
      )}
    </SectionCard>
  );
}

import { CircleCheck, Flame, Timer, type LucideIcon } from "lucide-react";

type Stat = { label: string; value: string; unit?: string; icon: LucideIcon };

/** Bugün ekranının üstündeki küçük özet şeridi. */
export function SummaryStrip({
  studiedMinutes,
  completedTasks,
  streakDays,
}: {
  studiedMinutes: number;
  completedTasks: number;
  streakDays: number;
}) {
  const stats: Stat[] = [
    { label: "Bugün çalışılan", value: String(studiedMinutes), unit: "dk", icon: Timer },
    { label: "Tamamlanan görev", value: String(completedTasks), icon: CircleCheck },
    { label: "Seri", value: String(streakDays), unit: "gün", icon: Flame },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3 md:gap-4">
      {stats.map(({ label, value, unit, icon: Icon }) => (
        <div
          key={label}
          className="flex flex-col-reverse justify-end gap-1 rounded-xl border border-line bg-surface p-3 sm:flex-col sm:gap-3 sm:p-4"
        >
          <dt className="flex items-center gap-2 text-xs text-ink-muted sm:text-13">
            <Icon className="hidden size-4 shrink-0 text-ink-subtle sm:block" strokeWidth={1.8} aria-hidden />
            <span>{label}</span>
          </dt>
          <dd className="tabular flex items-baseline gap-1">
            <span className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{value}</span>
            {unit && <span className="text-13 text-ink-muted">{unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

"use client";

import type { useReport } from "./use-report";

type Rows = ReturnType<typeof useReport>["perCourse"];

export function AttendanceTable({ rows }: { rows: Rows }) {
  const list = rows.filter((r) => r.attended + r.missed + r.postponed > 0);
  if (!list.length) return <p className="text-13 text-ink-muted">Bu dönemde yoklama kaydı yok.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-13">
        <thead>
          <tr className="text-xs text-ink-muted">
            <th className="pb-2 text-left font-medium">Ders</th>
            <th className="pb-2 text-right font-medium">Katıldı</th>
            <th className="pb-2 text-right font-medium">Kaçırdı</th>
            <th className="pb-2 text-right font-medium">Ertelendi</th>
            <th className="pb-2 text-right font-medium">Oran</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {list.map((r) => {
            const all = r.attended + r.missed + r.postponed;
            return (
              <tr key={r.course.id} data-course={r.course.color}>
                <td className="py-2.5">
                  <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-course-solid" aria-hidden />{r.course.name}</span>
                </td>
                <td className="tabular py-2.5 text-right">{r.attended}</td>
                <td className="tabular py-2.5 text-right">{r.missed}</td>
                <td className="tabular py-2.5 text-right">{r.postponed}</td>
                <td className="tabular py-2.5 text-right font-medium">%{Math.round((r.attended / all) * 100)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

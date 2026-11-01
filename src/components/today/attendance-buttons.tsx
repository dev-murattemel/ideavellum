"use client";

import { CircleCheck, CircleX, Clock3 } from "lucide-react";

import type { AttendanceStatus } from "@/lib/data/types";
import { setAttendance } from "@/lib/domain/tasks";
import { cn } from "@/lib/utils";

const OPTIONS: { id: AttendanceStatus; label: string; icon: typeof CircleCheck }[] = [
  { id: "attended", label: "Katıldım", icon: CircleCheck },
  { id: "missed", label: "Kaçırdım", icon: CircleX },
  { id: "postponed", label: "Erteledim", icon: Clock3 },
];

/** Tek tıkla yoklama. Üst öğede data-course olmalı. */
export function AttendanceButtons({ sessionId, date, value, compact = false }: { sessionId: string; date: string; value?: AttendanceStatus; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Yoklama" className="inline-flex rounded-lg bg-surface/60 p-0.5">
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const checked = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            onClick={() => setAttendance(sessionId, date, id)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              compact ? "h-7 px-2 text-xs" : "h-8 px-2.5 text-13",
              checked ? "bg-surface text-course-fg shadow-[0_0_0_1px_var(--course-solid)]" : "text-course-fg/75 hover:bg-surface/70 hover:text-course-fg",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}

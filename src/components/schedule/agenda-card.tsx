"use client";

import { ArrowRight, Clipboard, Clock3, ListChecks, MapPin, MoreHorizontal, Pencil } from "lucide-react";

import { AttendanceButtons } from "@/components/today/attendance-buttons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { kindOf } from "@/lib/area-kinds";
import type { AttendanceStatus, SessionEntry } from "@/lib/data/types";
import type { Occurrence } from "@/lib/domain/schedule";
import { isoDate, minutesToTime, relativeDay } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/** Gündem panelindeki tek kart: ders, gün ve saat, o günün başlığı, eylemler */
export function AgendaCard({ o, today, entry, attendance, askAttendance }: {
  o: Occurrence;
  today: Date;
  entry?: SessionEntry;
  attendance?: AttendanceStatus;
  /** Yoklama bekleyen sekmesinde Katıldım / Kaçırdım düğmeleri görünür */
  askAttendance?: boolean;
}) {
  const vocab = kindOf(o.course);
  const date = isoDate(o.date);
  const checks = entry?.checklist ?? [];
  const open = () => ui().openOccurrence({ sessionId: o.session.id, date });

  return (
    <article data-course={o.course.color} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{o.course.name}</h3>
          <p className="truncate text-xs text-ink-muted">{entry?.title ?? vocab.label}</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-course text-course-fg" aria-hidden>
          <vocab.icon className="size-4" />
        </span>
      </header>

      <ul className="flex flex-col gap-2 border-l-2 border-line pl-3 text-13">
        <li className="tabular flex items-center gap-2">
          <Clock3 className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
          <span className="font-medium">{relativeDay(o.date, today)}</span>
          <span className="text-ink-muted">·</span>
          {minutesToTime(o.start)} <ArrowRight className="size-3 text-ink-subtle" aria-hidden /> {minutesToTime(o.end)}
        </li>
        {o.session.location && (
          <li className="flex items-center gap-2 text-ink-muted">
            <MapPin className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
            <span className="truncate">{o.session.location}</span>
          </li>
        )}
        {checks.length > 0 && (
          <li className="tabular flex items-center gap-2 text-ink-muted">
            <ListChecks className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
            {checks.filter((c) => c.done).length}/{checks.length} madde
          </li>
        )}
      </ul>

      {askAttendance && (
        <div><AttendanceButtons compact sessionId={o.session.id} date={date} value={attendance} /></div>
      )}

      <div className="flex items-center gap-2">
        <Button className="flex-1" size="sm" onClick={open}>Ayrıntıyı aç</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon-sm" aria-label={`${o.course.name} için diğer eylemler`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => ui().setClip({ sessionId: o.session.id, date })}><Clipboard /> Kopyala</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => ui().open({ type: "session", sessionId: o.session.id })}><Pencil /> Saati düzenle</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

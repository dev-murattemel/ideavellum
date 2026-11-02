"use client";

import * as React from "react";
import { CircleCheck, CircleX, Clock3, ListChecks, MapPin } from "lucide-react";

import type { AttendanceStatus, SessionEntry } from "@/lib/data/types";
import { minutesToTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { minToPx, PX_PER_MIN } from "./constants";
import type { Placed } from "./lanes";

const ATTENDANCE_ICON = { attended: CircleCheck, missed: CircleX, postponed: Clock3 } as const;
const ATTENDANCE_LABEL = { attended: "Katıldın", missed: "Kaçırdın", postponed: "Ertelendi" } as const;

export function SessionBlock({
  item,
  start,
  end,
  dragging,
  attendance,
  entry,
  past,
  onPointerDown,
  onResizeStart,
  onOpen,
  onKeyMove,
  onCopy,
}: {
  item: Placed;
  start: number;
  end: number;
  dragging: boolean;
  attendance?: AttendanceStatus;
  /** O günün ayrıntısı: başlık ("Üst göğüs") ve liste ilerlemesi kartta görünür */
  entry?: SessionEntry;
  past: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent) => void;
  onOpen: () => void;
  onKeyMove: (dDay: number, dStart: number, dEnd: number) => void;
  /** Ctrl/Cmd + C ile kopyala */
  onCopy?: () => void;
}) {
  const pointerType = React.useRef<string>("mouse");
  const height = (end - start) * PX_PER_MIN;
  const compact = height < 44;
  const Icon = attendance ? ATTENDANCE_ICON[attendance] : null;
  const title = entry?.title;
  const checks = entry?.checklist ?? [];
  const doneChecks = checks.filter((c) => c.done).length;
  // İlk satır her zaman saat + ad; kalan satırlara öncelik sırasıyla başlık, liste, yer
  // Dar sütunda saat ve ad iki satıra bölünür; bir satır daha az yer kalır
  const lines = compact ? 0 : Math.floor((height - 12 + 2) / 18) - 2;
  const wants = [title ? "title" : null, checks.length ? "checks" : null, item.session.location ? "location" : null].filter(Boolean).slice(0, Math.max(0, lines));
  const show = { title: wants.includes("title"), checks: wants.includes("checks"), location: wants.includes("location") };
  const label = `${item.course.name}${title ? `, ${title}` : ""}, ${minutesToTime(start)}–${minutesToTime(end)}${attendance ? `, ${ATTENDANCE_LABEL[attendance]}` : ""}${checks.length ? `, liste ${doneChecks}/${checks.length}` : ""}`;

  return (
    <div
      data-course={item.course.color}
      className={cn("absolute px-0.5", dragging && "z-30")}
      style={{
        top: minToPx(start),
        height,
        left: `${(item.lane / item.lanes) * 100}%`,
        width: `${100 / item.lanes}%`,
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown"
        title="Tıkla: günün ayrıntısı · Sürükle: taşı · Alt kenar: uzat"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
          onPointerDown(e);
        }}
        onClick={(e) => {
          if (pointerType.current === "touch" || e.detail === 0) onOpen();
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && onCopy) {
            e.preventDefault();
            return onCopy();
          }
          const step = 15;
          const map: Record<string, [number, number, number]> = e.shiftKey
            ? { ArrowUp: [0, 0, -step], ArrowDown: [0, 0, step] }
            : { ArrowUp: [0, -step, -step], ArrowDown: [0, step, step], ArrowLeft: [-1, 0, 0], ArrowRight: [1, 0, 0] };
          const m = map[e.key];
          if (m) {
            e.preventDefault();
            onKeyMove(...m);
          }
        }}
        className={cn(
          "group @container relative flex h-full w-full cursor-grab flex-col overflow-hidden rounded-lg bg-course text-left text-course-fg ring-1 ring-course-solid/15 ring-inset transition-[box-shadow,filter] select-none hover:brightness-[0.98]",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          compact ? "flex-row items-center gap-1.5 pr-2 pl-3" : "gap-0.5 py-1.5 pr-2 pl-3",
          dragging && "cursor-grabbing shadow-lift",
          past && !dragging && "opacity-75",
        )}
      >
        <span aria-hidden className="absolute inset-y-1 left-1 w-[3px] rounded-full bg-course-solid" />
        <span className={cn("flex min-w-0 font-semibold", compact ? "items-baseline gap-1.5 text-xs" : "flex-col text-13 leading-4 @[170px]:flex-row @[170px]:items-baseline @[170px]:gap-1.5")}>
          <span className="tabular shrink-0 whitespace-nowrap">{minutesToTime(start)}–{minutesToTime(end)}</span>
          <span className="truncate">{item.course.name}</span>
        </span>
        {show.title && <span className="truncate text-xs leading-4 opacity-85">{title}</span>}
        {show.location && (
          <span className="flex items-center gap-1 truncate text-xs opacity-80">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{item.session.location}</span>
          </span>
        )}
        {show.checks && (
          <span className="tabular mt-auto flex items-center gap-1 text-xs opacity-80">
            <ListChecks className="size-3 shrink-0" aria-hidden />
            {doneChecks}/{checks.length}
          </span>
        )}
        {Icon && (
          <Icon className="absolute top-1.5 right-1.5 size-3.5" aria-hidden strokeWidth={2.2} />
        )}
      </button>
      <span
        aria-hidden
        onPointerDown={onResizeStart}
        className="absolute inset-x-1 bottom-0 flex h-2 cursor-ns-resize touch-none justify-center"
      >
        <span className="mt-0.5 h-1 w-6 rounded-full bg-course-solid/0 transition-colors hover:bg-course-solid/60" />
      </span>
    </div>
  );
}

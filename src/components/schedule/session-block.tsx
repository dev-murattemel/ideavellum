"use client";

import * as React from "react";
import { CircleCheck, CircleX, Clock3, MapPin } from "lucide-react";

import type { AttendanceStatus } from "@/lib/data/types";
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
  past,
  onPointerDown,
  onResizeStart,
  onOpen,
  onKeyMove,
}: {
  item: Placed;
  start: number;
  end: number;
  dragging: boolean;
  attendance?: AttendanceStatus;
  past: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent) => void;
  onOpen: () => void;
  onKeyMove: (dDay: number, dStart: number, dEnd: number) => void;
}) {
  const pointerType = React.useRef<string>("mouse");
  const height = (end - start) * PX_PER_MIN;
  const compact = height < 44;
  const Icon = attendance ? ATTENDANCE_ICON[attendance] : null;
  const label = `${item.course.name}, ${minutesToTime(start)}–${minutesToTime(end)}${attendance ? `, ${ATTENDANCE_LABEL[attendance]}` : ""}`;

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
        title="Sürükleyerek taşı, alt kenardan çekerek uzat"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
          onPointerDown(e);
        }}
        onClick={(e) => {
          if (pointerType.current === "touch" || e.detail === 0) onOpen();
        }}
        onKeyDown={(e) => {
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
          "group relative flex h-full w-full cursor-grab flex-col overflow-hidden rounded-md border-l-[3px] border-course-solid bg-course text-left text-course-fg transition-shadow select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          compact ? "flex-row items-center gap-1.5 px-2" : "gap-0.5 px-2 py-1.5",
          dragging && "cursor-grabbing shadow-lift",
          past && !dragging && "opacity-75",
        )}
      >
        <span className={cn("truncate font-semibold", compact ? "text-xs" : "text-13 leading-4")}>{item.course.name}</span>
        <span className="tabular truncate text-xs opacity-80">
          {minutesToTime(start)}–{minutesToTime(end)}
        </span>
        {!compact && height >= 64 && item.session.location && (
          <span className="flex items-center gap-1 truncate text-xs opacity-80">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{item.session.location}</span>
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

"use client";

import * as React from "react";
import { isSameDay } from "date-fns";

import { useRows } from "@/lib/data/hooks";
import { courseOf, matchFilter, moveToWeekday, occurrencesOn } from "@/lib/domain/schedule";
import { data } from "@/lib/data/store";
import { fmt, isoDate, isoWeekday, minutesOfDay, minutesToTime, timeToMinutes, WEEKDAY_SHORT } from "@/lib/time";
import { ui, useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { entryKey } from "@/lib/domain/session-entries";
import { pasteClip, usePasteShortcut } from "./clip";
import { clampMin, DAY_END, DAY_START, HOUR_PX, minToPx, PX_PER_MIN, SNAP } from "./constants";
import { placeLanes } from "./lanes";
import { SlotGhost } from "./slot-ghost";
import { SessionBlock } from "./session-block";
import { useBlockDrag } from "./use-block-drag";
import { useNow } from "./use-now";

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START / 60 + i);

export function WeekGrid({ days, filter = null }: { days: Date[]; filter?: string | null }) {
  const allSessions = useRows("class_sessions");
  const sessions = React.useMemo(() => allSessions.filter((s) => matchFilter(s, filter)), [allSessions, filter]);
  const courses = useRows("courses");
  const attendance = useRows("attendance");
  const entries = useRows("session_entries");
  const clip = useUI((s) => s.clip);
  const now = useNow();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const colsRef = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<{ day: number; min: number } | null>(null);

  const courseMap = React.useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);
  const attMap = React.useMemo(
    () => new Map(attendance.map((a) => [`${a.class_session_id}|${a.date}`, a.status])),
    [attendance],
  );
  const entryMap = React.useMemo(() => new Map(entries.map((e) => [entryKey(e.class_session_id, e.date), e])), [entries]);
  const clipSession = clip ? data().class_sessions[clip.sessionId] : undefined;
  const clipCourse = clipSession ? courseOf(clipSession, courseMap) : undefined;
  const clipLen = clipSession ? timeToMinutes(clipSession.end_time) - timeToMinutes(clipSession.start_time) : 60;
  const columns = React.useMemo(
    () => days.map((d) => placeLanes(occurrencesOn(sessions, courseMap, d))),
    [days, sessions, courseMap],
  );

  const { preview, begin } = useBlockDrag({
    dayCount: days.length,
    columnWidth: () => (colsRef.current ? colsRef.current.getBoundingClientRect().width / days.length : 0),
    onCommit: (id, dayIndex, start, end) =>
      data().update("class_sessions", id, {
        ...moveToWeekday(data().class_sessions[id], isoWeekday(days[dayIndex])),
        start_time: minutesToTime(start),
        end_time: minutesToTime(end),
      }),
    onClick: (id, dayIndex) => ui().openOccurrence({ sessionId: id, date: isoDate(days[dayIndex]) }),
  });

  // İlk açılışta şu anki saatin biraz öncesine kaydır
  React.useEffect(() => {
    const target = Math.max(DAY_START, Math.min(minutesOfDay(new Date()) - 60, DAY_END - 6 * 60));
    scrollRef.current?.scrollTo({ top: minToPx(target) });
  }, []);

  usePasteShortcut(!!clip, hover && { date: days[hover.day], min: hover.min });

  const slotAt = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return clampMin(Math.floor((DAY_START + (e.clientY - rect.top) / PX_PER_MIN) / SNAP) * SNAP, 60);
  };

  const nowMin = minutesOfDay(now);
  const todayIndex = days.findIndex((d) => isSameDay(d, now));
  const nowVisible = todayIndex >= 0 && nowMin >= DAY_START && nowMin < DAY_END;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div ref={scrollRef} className="relative max-h-[max(480px,calc(100dvh-280px))] overflow-auto overscroll-contain">
        <div className={cn(days.length > 1 && "min-w-[820px]")}>
          {/* Gün başlıkları */}
          <div className="sticky top-0 z-20 flex border-b border-line bg-surface/95 backdrop-blur">
            <div className="w-14 shrink-0" />
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {days.map((d, i) => {
                const isToday = i === todayIndex;
                const count = columns[i].length;
                return (
                  <div key={i} className="flex h-14 items-center justify-center gap-2.5 border-l border-line px-2 first:border-l-0">
                    <span
                      className={cn(
                        "tabular flex size-8 shrink-0 items-center justify-center rounded-lg text-base font-semibold",
                        isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {fmt(d, "d")}
                    </span>
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className={cn("truncate text-13", isToday ? "font-semibold text-foreground" : "font-medium text-ink-muted")}>
                        {days.length === 1 ? fmt(d, "EEEE") : WEEKDAY_SHORT[isoWeekday(d) - 1]}
                      </span>
                      <span className="tabular truncate text-xs text-ink-subtle">{count ? `${count} saat` : "boş"}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex" style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}>
            {/* Saat etiketleri */}
            <div className="relative w-14 shrink-0" aria-hidden>
              {HOURS.map((h) => (
                <span key={h} className="tabular absolute right-2 -translate-y-1/2 text-xs text-ink-subtle" style={{ top: (h * 60 - DAY_START) * PX_PER_MIN }}>
                  {h === DAY_START / 60 ? "" : `${String(h).padStart(2, "0")}:00`}
                </span>
              ))}
              {nowVisible && (
                <span className="tabular absolute right-1 z-10 -translate-y-1/2 rounded-sm bg-destructive px-1 text-xs font-medium text-white" style={{ top: minToPx(nowMin) }}>
                  {minutesToTime(nowMin)}
                </span>
              )}
            </div>

            <div ref={colsRef} className="relative grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
              {/* Saat çizgileri */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {HOURS.map((h) => (
                  <React.Fragment key={h}>
                    <div className="absolute inset-x-0 border-t border-line" style={{ top: (h - DAY_START / 60) * HOUR_PX }} />
                    <div className="absolute inset-x-0 border-t border-dashed border-line/60" style={{ top: (h - DAY_START / 60) * HOUR_PX + HOUR_PX / 2 }} />
                  </React.Fragment>
                ))}
              </div>

              {days.map((d, i) => {
                const date = isoDate(d);
                const isPastDay = isoDate(d) < isoDate(now);
                return (
                  <div
                    key={i}
                    role="presentation"
                    className={cn("relative border-l border-line first:border-l-0", i === todayIndex && "bg-accent-soft/35", clip && "cursor-copy")}
                    onMouseMove={(e) => e.target === e.currentTarget && setHover({ day: i, min: slotAt(e) })}
                    onMouseLeave={() => setHover(null)}
                    onClick={(e) => {
                      if (e.target !== e.currentTarget) return;
                      const start = slotAt(e);
                      if (clip) return void pasteClip(d, start);
                      ui().open({ type: "session", preset: { weekday: isoWeekday(d), start_time: minutesToTime(start), end_time: minutesToTime(start + 60) } });
                    }}
                  >
                    {hover?.day === i && !preview && <SlotGhost min={hover.min} clipColor={clip ? clipCourse?.color : undefined} clipLen={clipLen} />}
                    {columns[i].map((item) => {
                      if (preview?.id === item.session.id) return null;
                      const past = isPastDay || (i === todayIndex && timeToMinutes(item.session.end_time) <= nowMin);
                      return (
                        <SessionBlock
                          key={item.session.id}
                          item={item}
                          start={item.start}
                          end={item.end}
                          dragging={false}
                          past={past}
                          attendance={past ? attMap.get(`${item.session.id}|${date}`) : undefined}
                          entry={entryMap.get(entryKey(item.session.id, date))}
                          onCopy={() => ui().setClip({ sessionId: item.session.id, date })}
                          onPointerDown={begin(item.session.id, i, item.start, item.end, "move")}
                          onResizeStart={begin(item.session.id, i, item.start, item.end, "resize")}
                          onOpen={() => ui().openOccurrence({ sessionId: item.session.id, date })}
                          onKeyMove={(dd, ds, de) => {
                            const s = clampMin(item.start + ds, item.end - item.start);
                            const e2 = Math.max(s + SNAP, Math.min(DAY_END, de === ds ? s + (item.end - item.start) : item.end + de));
                            data().update("class_sessions", item.session.id, {
                              ...moveToWeekday(item.session, ((item.session.weekday - 1 + dd + 7) % 7) + 1),
                              start_time: minutesToTime(s),
                              end_time: minutesToTime(e2),
                            });
                          }}
                        />
                      );
                    })}
                    {preview && preview.dayIndex === i && (() => {
                      const item = columns.flat().find((c) => c.session.id === preview.id);
                      if (!item) return null;
                      return (
                        <SessionBlock
                          item={{ ...item, lane: 0, lanes: 1 }}
                          entry={entryMap.get(entryKey(item.session.id, isoDate(days[Math.max(0, columns.findIndex((c) => c.some((x) => x.session.id === preview.id)))])))}
                          start={preview.start}
                          end={preview.end}
                          dragging
                          past={false}
                          onPointerDown={() => {}}
                          onResizeStart={() => {}}
                          onOpen={() => {}}
                          onKeyMove={() => {}}
                        />
                      );
                    })()}
                    {nowVisible && i === todayIndex && (
                      <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: minToPx(nowMin) }}>
                        <span className="-ml-1 size-2 rounded-full bg-destructive" />
                        <span className="h-px flex-1 bg-destructive" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

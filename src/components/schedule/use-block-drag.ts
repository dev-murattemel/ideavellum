"use client";

import * as React from "react";

import { clampMin, PX_PER_MIN, snap, SNAP } from "./constants";

export type DragPreview = { id: string; dayIndex: number; start: number; end: number };

type Active = {
  id: string;
  mode: "move" | "resize";
  x: number;
  y: number;
  dayIndex: number;
  start: number;
  end: number;
  moved: boolean;
};

/**
 * Takvim bloklarını fareyle sürükleyip taşıma ve alt kenardan uzatma.
 * Dokunmatikte blok dokununca düzenleme açılır (sayfa kaydırması bozulmasın diye); uzatma tutamacı dokunmatikte de çalışır.
 */
export function useBlockDrag({
  dayCount,
  columnWidth,
  onCommit,
  onClick,
}: {
  dayCount: number;
  columnWidth: () => number;
  onCommit: (id: string, dayIndex: number, start: number, end: number) => void;
  onClick: (id: string, dayIndex: number) => void;
}) {
  const active = React.useRef<Active | null>(null);
  const [preview, setPreview] = React.useState<DragPreview | null>(null);

  const compute = React.useCallback(
    (a: Active, ev: PointerEvent): DragPreview => {
      const dyMin = snap((ev.clientY - a.y) / PX_PER_MIN);
      if (a.mode === "resize") {
        return { id: a.id, dayIndex: a.dayIndex, start: a.start, end: Math.max(a.start + SNAP, clampMin(a.end + dyMin)) };
      }
      const duration = a.end - a.start;
      const start = clampMin(a.start + dyMin, duration);
      const w = columnWidth();
      const dayDelta = w > 0 ? Math.round((ev.clientX - a.x) / w) : 0;
      const dayIndex = Math.max(0, Math.min(dayCount - 1, a.dayIndex + dayDelta));
      return { id: a.id, dayIndex, start, end: start + duration };
    },
    [columnWidth, dayCount],
  );

  React.useEffect(() => {
    const move = (ev: PointerEvent) => {
      const a = active.current;
      if (!a) return;
      if (!a.moved && Math.hypot(ev.clientX - a.x, ev.clientY - a.y) < 4) return;
      a.moved = true;
      setPreview(compute(a, ev));
    };
    const up = (ev: PointerEvent) => {
      const a = active.current;
      if (!a) return;
      active.current = null;
      setPreview(null);
      if (!a.moved) return a.mode === "move" && onClick(a.id, a.dayIndex);
      const p = compute(a, ev);
      if (p.dayIndex !== a.dayIndex || p.start !== a.start || p.end !== a.end) onCommit(a.id, p.dayIndex, p.start, p.end);
    };
    const cancel = () => {
      active.current = null;
      setPreview(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [compute, onClick, onCommit]);

  const begin =
    (id: string, dayIndex: number, start: number, end: number, mode: Active["mode"]) => (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      if (mode === "move" && e.pointerType === "touch") return; // dokunmatikte kaydırmaya izin ver
      e.preventDefault();
      active.current = { id, mode, x: e.clientX, y: e.clientY, dayIndex, start, end, moved: false };
    };

  return { preview, begin };
}

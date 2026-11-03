"use client";

import * as React from "react";

import { data } from "@/lib/data/store";
import type { StickyNote } from "@/lib/data/types";
import { STICKY_W, topZ } from "@/lib/domain/stickies";
import { StickyCard } from "./sticky-card";

type Drag = { id: string; dx: number; dy: number; startX: number; startY: number; moved: boolean };

/**
 * Mantar pano: notlar serbestçe konumlanır, sürükleyerek taşınır.
 * Süzgece uymayan notlar gizlenmez, soluklaşır (yerleri bozulmasın diye).
 */
export function CorkBoard({ stickies, match, editingId, setEditingId, onWidth }: {
  stickies: StickyNote[];
  match: (s: StickyNote) => boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onWidth: (w: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<Drag | null>(null);
  // Sürükleme bitince hemen ardından gelen tıklama notu düzenlemeye açmasın
  const droppedAt = React.useRef(0);
  const [width, setWidth] = React.useState(0);
  const [pos, setPos] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const posRef = React.useRef(pos);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      onWidth(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onWidth]);

  const clampX = (x: number) => Math.max(8, Math.min(Math.max(8, width - STICKY_W - 8), x));
  const height = Math.max(560, ...stickies.map((s) => s.y + 260));

  React.useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
      d.moved = true;
      const r = ref.current!.getBoundingClientRect();
      posRef.current = { id: d.id, x: clampX(e.clientX - r.left - d.dx), y: Math.max(8, e.clientY - r.top - d.dy) };
      setPos(posRef.current);
    };
    const up = () => {
      const d = drag.current;
      drag.current = null;
      const p = posRef.current;
      posRef.current = null;
      setPos(null);
      if (!d?.moved || !p) return;
      data().update("sticky_notes", p.id, { x: Math.round(p.x), y: Math.round(p.y), z: topZ() + 1 });
      droppedAt.current = performance.now();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  });

  const start = (s: StickyNote) => (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || editingId === s.id || (e.target as HTMLElement).closest("[data-no-drag],button,a,input,textarea")) return;
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { id: s.id, dx: e.clientX - r.left, dy: e.clientY - r.top, startX: e.clientX, startY: e.clientY, moved: false };
  };

  return (
    <div
      ref={ref}
      className="cork relative overflow-hidden rounded-2xl"
      style={{ height }}
      onClickCapture={(e) => {
        if (performance.now() - droppedAt.current < 400) e.stopPropagation();
      }}
    >
      {stickies.map((s) => {
        const p = pos?.id === s.id ? pos : null;
        const editing = editingId === s.id;
        return (
          <StickyCard
            key={s.id}
            s={s}
            editing={editing}
            onEdit={() => setEditingId(s.id)}
            onDone={() => setEditingId(null)}
            dragging={!!p}
            dimmed={!match(s) && !editing}
            onPointerDown={start(s)}
            className="absolute touch-none"
            style={{ left: p ? p.x : clampX(s.x), top: p ? p.y : s.y, zIndex: p || editing ? 9999 : s.z }}
          />
        );
      })}
      {stickies.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <p className="rounded-xl bg-surface/80 px-4 py-3 text-center text-13 text-ink-muted shadow-sm">
            Pano boş. Yukarıya aklına geleni yaz ve Enter’a bas; not buraya asılır.
          </p>
        </div>
      )}
    </div>
  );
}

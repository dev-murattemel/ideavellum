"use client";

import * as React from "react";

import { TagChip } from "@/components/tags/tag-chip";
import type { StickyNote } from "@/lib/data/types";
import { tilt } from "@/lib/domain/stickies";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { StickyEditor } from "./sticky-editor";
import { StickyMenu } from "./sticky-menu";

/**
 * Yapışkan not: hafif eğik kâğıt, üstte iğne, metin, etiketler.
 * Tıklayınca yerinde düzenlenir; panoda sürüklenir (sürükleme panodan yönetilir).
 */
export function StickyCard({ s, editing, onEdit, onDone, dragging, dimmed, className, style, onPointerDown, actions }: {
  s: StickyNote;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
  dragging?: boolean;
  dimmed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  /** Arşivde menü yerine farklı eylemler */
  actions?: React.ReactNode;
}) {
  const angle = editing || dragging ? 0 : tilt(s.id);
  return (
    <article
      data-course={s.color}
      aria-label={s.text ? s.text.split("\n")[0] : "Boş not"}
      onPointerDown={onPointerDown}
      style={{ ...style, rotate: `${angle}deg` }}
      className={cn(
        "group sticky-shadow relative flex w-[208px] flex-col gap-2 rounded-md bg-course px-4 pt-5 pb-3 text-course-fg transition-[rotate,opacity,box-shadow] duration-200 select-none motion-reduce:transition-none",
        editing ? "z-[999] min-h-[190px] cursor-auto shadow-panel" : "min-h-[160px] cursor-grab",
        dragging && "cursor-grabbing shadow-lift",
        dimmed && "opacity-25",
        className,
      )}
    >
      <span aria-hidden className="sticky-pin absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full" />
      {!actions && !editing && <div className="absolute top-1.5 right-1.5"><StickyMenu s={s} onEdit={onEdit} /></div>}
      {editing ? (
        <StickyEditor s={s} onDone={onDone} />
      ) : (
        <>
          <p
            onClick={onEdit}
            className={cn("line-clamp-[9] flex-1 pr-3 text-[15px] leading-6 break-words whitespace-pre-wrap", !s.text && "italic opacity-60")}
          >
            {s.text || "Boş not, yazmak için tıkla"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {s.tags.map((t) => <TagChip key={t} tag={t} className="bg-surface/60" />)}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="tabular text-xs opacity-60">
              {timeAgo(s.created_at)}
              {s.converted_to && ` · ${s.converted_to === "task" ? "göreve" : "nota"} çevrildi`}
            </p>
            {actions}
          </div>
        </>
      )}
    </article>
  );
}

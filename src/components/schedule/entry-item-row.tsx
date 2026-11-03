"use client";

import * as React from "react";
import { BookOpen, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import type { EntryCheck } from "@/lib/data/types";
import { exerciseGuide } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { MeasureFields } from "./measure-fields";

/** Listedeki tek madde: işaret, ad (çift tıkla düzenle), ölçü kutuları, sil */
export function EntryItemRow({ c, onChange, onRemove }: { c: EntryCheck; onChange: (p: Partial<EntryCheck>) => void; onRemove: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const hasFields = !!c.metric && c.metric !== "plain";
  const guide = exerciseGuide(c.label);

  return (
    <li className="group flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-lg px-1.5 py-1.5 hover:bg-hover/60">
      <Checkbox checked={c.done} onCheckedChange={(v) => onChange({ done: v === true })} aria-label={`${c.label} tamamlandı`} />
      <div className="min-w-[120px] flex-1">
        {editing ? (
          <input
            autoFocus
            defaultValue={c.label}
            aria-label="Maddenin adı"
            onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.label) onChange({ label: v }); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false); }}
            className="h-8 w-full rounded-md bg-sunken px-1.5 text-sm outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            title="Çift tıklayarak adını değiştir"
            className={cn("block truncate text-sm", c.done && "text-ink-muted line-through")}
          >
            {c.label}
          </span>
        )}
      </div>
      {guide && (
        <button
          type="button"
          onClick={() => ui().openGuide({ type: "exercise", id: guide.name })}
          aria-label={`${guide.name} nasıl yapılır`}
          title="Nasıl yapılır"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BookOpen className="size-3.5" />
        </button>
      )}
      {hasFields && (
        <div className={cn("ml-7 flex items-center gap-1.5 sm:ml-0", c.done && "opacity-60")}>
          <MeasureFields c={c} onChange={onChange} />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${c.label} maddesini sil`}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-hover hover:text-destructive focus-visible:opacity-100 max-sm:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

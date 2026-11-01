"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useRows } from "@/lib/data/hooks";
import { positionAtEnd, sortByPosition } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import { cn } from "@/lib/utils";

export function TaskChecklist({ taskId }: { taskId: string }) {
  const all = useRows("task_checklist_items");
  const items = React.useMemo(() => sortByPosition(all.filter((i) => i.task_id === taskId)), [all, taskId]);
  const [draft, setDraft] = React.useState("");
  const done = items.filter((i) => i.is_done).length;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    data().insert("task_checklist_items", { task_id: taskId, label: draft.trim(), is_done: false, position: positionAtEnd(items) });
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-13 font-semibold">Kontrol listesi</h3>
        {items.length > 0 && <span className="tabular text-xs text-ink-muted">{done}/{items.length}</span>}
      </div>
      {items.length > 0 && <Progress value={(done / items.length) * 100} label="Kontrol listesi ilerlemesi" />}
      <ul className="flex flex-col">
        {items.map((i) => (
          <li key={i.id} className="group flex items-center gap-2.5 rounded-md px-1 py-1 hover:bg-hover/60">
            <Checkbox
              checked={i.is_done}
              onCheckedChange={(c) => data().update("task_checklist_items", i.id, { is_done: c === true })}
              aria-label={i.label}
            />
            <span className={cn("flex-1 text-sm", i.is_done && "text-ink-muted line-through")}>{i.label}</span>
            <button
              type="button"
              onClick={() => data().remove("task_checklist_items", i.id)}
              aria-label={`${i.label} maddesini sil`}
              className="flex size-6 cursor-pointer items-center justify-center rounded-sm text-ink-subtle opacity-0 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex items-center gap-2 rounded-md border border-dashed border-line-strong px-2">
        <Plus className="size-4 text-ink-subtle" aria-hidden />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Madde ekle"
          aria-label="Yeni kontrol maddesi"
          className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
        />
      </form>
    </div>
  );
}

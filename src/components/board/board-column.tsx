"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Ellipsis, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskStatus } from "@/lib/data/types";
import { STATUSES } from "@/lib/domain/tasks";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { SortableTaskCard, type CardData } from "./task-card";

export function BoardColumn({
  status,
  cards,
  now,
  hiddenCount,
  onShowHidden,
}: {
  status: TaskStatus;
  cards: CardData[];
  now: Date;
  hiddenCount?: number;
  onShowHidden?: () => void;
}) {
  const meta = STATUSES.find((s) => s.id === status)!;
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });

  return (
    <section aria-label={meta.label} className={cn("flex min-h-[420px] flex-col rounded-xl bg-sunken/70 p-2 transition-colors", isOver && "bg-accent-soft/60")}>
      <header className="flex h-10 items-center gap-2 pr-0.5 pl-1">
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-surface px-2 text-13 font-medium">
          <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
          {meta.label}
        </span>
        <span className="tabular text-13 text-ink-muted">{cards.length}</span>
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon-sm" aria-label={`${meta.label} sütununa görev ekle`} onClick={() => ui().open({ type: "task", preset: { status } })}>
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`${meta.label} sütunu menüsü`}><Ellipsis /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => ui().open({ type: "task", preset: { status } })}><Plus /> Görev ekle</DropdownMenuItem>
              {status === "done" && !!hiddenCount && (
                <DropdownMenuItem onSelect={onShowHidden}>14 günden eski {hiddenCount} kartı göster</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <SortableContext id={status} items={cards.map((c) => c.task.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="mt-1 flex flex-1 flex-col gap-2">
          {cards.map((c) => <SortableTaskCard key={c.task.id} {...c} now={now} />)}
          {cards.length === 0 && (
            <li className="flex h-11 list-none items-center justify-center rounded-lg border border-dashed border-line-strong text-13 text-ink-subtle">
              Kartı buraya bırak
            </li>
          )}
        </ul>
      </SortableContext>
      {status === "done" && !!hiddenCount && (
        <button type="button" onClick={onShowHidden} className="mt-2 cursor-pointer rounded-md py-1.5 text-xs text-ink-muted hover:bg-hover hover:text-foreground">
          14 günden eski {hiddenCount} kart gizli · göster
        </button>
      )}
    </section>
  );
}

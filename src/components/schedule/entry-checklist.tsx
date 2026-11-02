"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { EntryCheck } from "@/lib/data/types";
import { newCheck } from "@/lib/domain/session-entries";
import { cn } from "@/lib/utils";

/**
 * O güne ait kontrol listesi: setler ("Bench press 4×10"), malzemeler, adımlar.
 * Maddeye çift tıklayınca düzenlenir; Enter ile yeni madde eklenir.
 */
export function EntryChecklist({ items, onChange, placeholder, title }: { items: EntryCheck[]; onChange: (v: EntryCheck[]) => void; placeholder: string; title: string }) {
  const [draft, setDraft] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const done = items.filter((i) => i.done).length;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = draft.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    onChange([...items, ...lines.map(newCheck)]);
    setDraft("");
  };
  const patch = (id: string, p: Partial<EntryCheck>) => onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-13 font-semibold">{title}</h3>
        {items.length > 0 && <span className="tabular text-xs text-ink-muted">{done}/{items.length}</span>}
      </div>
      {items.length > 0 && <Progress value={(done / items.length) * 100} label="Kontrol listesi ilerlemesi" />}
      <ul className="flex flex-col">
        {items.map((i) => (
          <li key={i.id} className="group flex min-h-9 items-center gap-2.5 rounded-md px-1 hover:bg-hover/60">
            <Checkbox checked={i.done} onCheckedChange={(c) => patch(i.id, { done: c === true })} aria-label={i.label} />
            {editing === i.id ? (
              <input
                autoFocus
                defaultValue={i.label}
                aria-label="Maddeyi düzenle"
                onBlur={(e) => { const v = e.target.value.trim(); if (v) patch(i.id, { label: v }); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(null); }}
                className="h-8 flex-1 rounded-sm bg-sunken px-1.5 text-sm outline-none"
              />
            ) : (
              <span
                onDoubleClick={() => setEditing(i.id)}
                className={cn("tabular flex-1 py-1.5 text-sm", i.done && "text-ink-muted line-through")}
              >
                {i.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x.id !== i.id))}
              aria-label={`${i.label} maddesini sil`}
              className="flex size-6 cursor-pointer items-center justify-center rounded-sm text-ink-subtle opacity-0 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex items-center gap-2 rounded-md border border-dashed border-line-strong px-2 focus-within:border-ring">
        <Plus className="size-4 text-ink-subtle" aria-hidden />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPaste={(e) => {
            // Birden çok satır yapıştırılırsa her satır ayrı madde olur
            const text = e.clipboardData.getData("text");
            if (text.includes("\n")) {
              e.preventDefault();
              const lines = text.split("\n").map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
              onChange([...items, ...lines.map(newCheck)]);
            }
          }}
          placeholder={placeholder}
          aria-label="Yeni madde"
          className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
        />
      </form>
    </div>
  );
}

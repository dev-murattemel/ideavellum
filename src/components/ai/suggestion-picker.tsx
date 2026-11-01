"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";

export type Pick = { id: string; title: string; detail?: string; group: string };

/** Önerileri işaretle; hiçbir şey onaylanmadan kaydedilmez. */
export function SuggestionPicker({ items, selected, onToggle }: { items: Pick[]; selected: Set<string>; onToggle: (id: string) => void }) {
  const groups = [...new Set(items.map((i) => i.group))];
  if (!items.length) return <p className="text-13 text-ink-muted">Bu içerikten öneri çıkmadı.</p>;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <fieldset key={g} className="flex flex-col gap-1">
          <legend className="mb-1 text-xs font-medium text-ink-muted">{g}</legend>
          {items.filter((i) => i.group === g).map((i) => (
            <label key={i.id} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-hover">
              <Checkbox checked={selected.has(i.id)} onCheckedChange={() => onToggle(i.id)} className="mt-0.5" aria-label={i.title} />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{i.title}</span>
                {i.detail && <span className="text-xs text-ink-muted">{i.detail}</span>}
              </span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

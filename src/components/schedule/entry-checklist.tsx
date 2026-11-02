"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { catalogFor } from "@/lib/catalog";
import type { AreaKind, EntryCheck } from "@/lib/data/types";
import { newCheck } from "@/lib/domain/session-entries";
import { CatalogCombobox } from "./catalog-combobox";
import { EntryItemRow } from "./entry-item-row";

/**
 * O güne ait liste: spor için hareketler (set · tekrar · kg), mutfak için malzemeler
 * (miktar · birim), Kuran için sureler. Hazır listeden aranır ya da yeni ad yazılır.
 */
export function EntryChecklist({ items, onChange, placeholder, title, kind, used }: {
  items: EntryCheck[];
  onChange: (v: EntryCheck[]) => void;
  placeholder: string;
  title: string;
  kind: AreaKind | undefined;
  /** Daha önce kullanılan maddeler (son ölçüleriyle) */
  used: EntryCheck[];
}) {
  const catalog = React.useMemo(() => catalogFor(kind), [kind]);
  const done = items.filter((i) => i.done).length;
  const patch = (id: string, p: Partial<EntryCheck>) => onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const sets = items.reduce((n, i) => n + (i.metric === "strength" ? (i.sets ?? 0) : 0), 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-13 font-semibold">{title}</h3>
        {items.length > 0 && (
          <span className="tabular text-xs text-ink-muted">
            {sets > 0 && `${sets} set · `}{done}/{items.length} tamam
          </span>
        )}
      </div>
      {items.length > 0 && <Progress value={(done / items.length) * 100} label={`${title} ilerlemesi`} />}
      {items.length > 0 && (
        <ul className="-mx-1.5 flex flex-col">
          {items.map((c) => (
            <EntryItemRow key={c.id} c={c} onChange={(p) => patch(c.id, p)} onRemove={() => onChange(items.filter((x) => x.id !== c.id))} />
          ))}
        </ul>
      )}
      <CatalogCombobox
        items={catalog.items}
        used={used.filter((u) => !items.some((i) => i.label.toLocaleLowerCase("tr") === u.label.toLocaleLowerCase("tr")))}
        fallback={catalog.fallback}
        unit={catalog.unit}
        placeholder={placeholder}
        onPick={({ label, ...extra }) => onChange([...items, newCheck(label, extra)])}
      />
    </div>
  );
}

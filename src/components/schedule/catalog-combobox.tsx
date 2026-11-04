"use client";

import * as React from "react";
import { History, Plus, Search } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { searchKey, type CatalogItem, type Metric } from "@/lib/catalog";
import { checkMeasure } from "@/lib/catalog/format";
import type { EntryCheck } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export type Pick = Omit<EntryCheck, "id" | "done">;

type Option =
  | { type: "used"; check: EntryCheck; key: string }
  | { type: "catalog"; item: CatalogItem; key: string }
  | { type: "create"; label: string; key: string };

const STRENGTH_DEFAULT = { sets: 3, reps: 10, weight: null };

/**
 * Listeye madde ekleme: yazdıkça hazır listede ve daha önce kullandıklarında arar.
 * Listede yoksa yazılan ad olduğu gibi eklenir. Daha önce kullanılan bir madde
 * son girilen ölçüleriyle gelir (ör. Bench press 4×10 · 60 kg).
 */
export function CatalogCombobox({ items, used, fallback, unit, placeholder, onPick, onPasteLines, onQueryChange }: {
  items: CatalogItem[];
  used: EntryCheck[];
  fallback: Metric;
  unit?: string;
  placeholder: string;
  onPick: (p: Pick) => void;
  /** Birden çok satır yapıştırılınca her satır ayrı madde olur */
  onPasteLines?: (lines: string[]) => void;
  /** Yazılıp henüz eklenmemiş metin (kaydederken kaybolmasın diye) */
  onQueryChange?: (q: string) => void;
}) {
  const [query, setQueryState] = React.useState("");
  const setQuery = (q: string) => {
    setQueryState(q);
    onQueryChange?.(q);
  };
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  const options = React.useMemo<Option[]>(() => {
    const q = searchKey(query);
    const usedKeys = new Set(used.map((u) => searchKey(u.label)));
    const match = (label: string) => !q || searchKey(label).includes(q);
    const usedOpts: Option[] = used.filter((u) => match(u.label)).slice(0, q ? 8 : 6).map((check) => ({ type: "used", check, key: `u:${check.label}` }));
    const catalogOpts: Option[] = items
      .filter((i) => !usedKeys.has(searchKey(i.label)) && match(i.label))
      .sort((a, b) => (q ? Number(!searchKey(a.label).startsWith(q)) - Number(!searchKey(b.label).startsWith(q)) : 0))
      .slice(0, q ? 30 : 200)
      .map((item) => ({ type: "catalog", item, key: `c:${item.group}:${item.label}` }));
    const exact = [...used.map((u) => u.label), ...items.map((i) => i.label)].some((l) => searchKey(l) === q);
    const create: Option[] = query.trim() && !exact ? [{ type: "create", label: query.trim(), key: "create" }] : [];
    return [...usedOpts, ...catalogOpts, ...create];
  }, [query, items, used]);

  const choose = (o: Option) => {
    if (o.type === "used") {
      const { label, metric, sets, reps, weight, minutes, km, amount, unit: u } = o.check;
      onPick({ label, metric, sets, reps, weight, minutes, km, amount, unit: u });
    } else if (o.type === "catalog") {
      const { label, metric, unit: u } = o.item;
      onPick({ label, metric, unit: u ?? null, ...(metric === "strength" ? STRENGTH_DEFAULT : {}) });
    } else {
      onPick({ label: o.label, metric: fallback, unit: unit ?? null, ...(fallback === "strength" ? STRENGTH_DEFAULT : {}) });
    }
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (options.length ? (a + d + options.length) % options.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = options[Math.min(active, options.length - 1)];
      if (o) choose(o);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  // Liste değişince vurgulu satır görünür kalsın
  React.useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  let lastGroup = "";
  return (
    <Popover open={open && options.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-2.5 focus-within:border-solid focus-within:border-ring">
          <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open ? `${listId}-${active}` : undefined}
            aria-label="Listeye ekle: ara ya da yaz"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onPaste={(e) => {
              const lines = e.clipboardData.getData("text").split(/\r?\n/).map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean);
              if (!onPasteLines || lines.length < 2) return;
              e.preventDefault();
              onPasteLines(lines);
              setQuery("");
            }}
            placeholder={placeholder}
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => { if (e.target instanceof Node && inputRef.current?.parentElement?.contains(e.target)) e.preventDefault(); }}
        className="w-[var(--radix-popper-anchor-width)] p-1"
      >
        <ul id={listId} role="listbox" aria-label="Öneriler" className="max-h-72 overflow-y-auto overscroll-contain">
          {options.map((o, i) => {
            const group = o.type === "used" ? "Son kullandıkların" : o.type === "catalog" ? o.item.group : "";
            const header = group && group !== lastGroup ? group : null;
            lastGroup = group;
            const measure = o.type === "used" ? checkMeasure(o.check) : "";
            return (
              <React.Fragment key={o.key}>
                {header && <li role="presentation" className="px-2 pt-2.5 pb-1 text-xs font-medium text-ink-subtle">{header}</li>}
                <li
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(o)}
                  onPointerMove={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    i === active && "bg-hover",
                    o.type === "create" && "mt-1 border-t border-line pt-2",
                  )}
                >
                  {o.type === "used" && <History className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />}
                  {o.type === "create" && <Plus className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />}
                  <span className="min-w-0 flex-1 truncate">
                    {o.type === "used" ? o.check.label : o.type === "catalog" ? o.item.label : <>“{o.label}” ekle</>}
                  </span>
                  {measure && <span className="tabular shrink-0 text-xs text-ink-muted">son: {measure}</span>}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

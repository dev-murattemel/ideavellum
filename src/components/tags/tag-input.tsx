"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useRows } from "@/lib/data/hooks";
import { normalizeTag, tagCounts } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { TagChip } from "./tag-chip";

/** Tüm notlar, günlük ve aforizmalardaki etiketler (öneri için) */
export function useAllTags() {
  const notes = useRows("notes");
  const journal = useRows("journal_entries");
  const quotes = useRows("quotes");
  return React.useMemo(() => tagCounts([...notes, ...journal, ...quotes]).map(([t]) => t), [notes, journal, quotes]);
}

/**
 * Etiket girişi: yaz + Enter (ya da virgül) ile ekler, Backspace ile sonuncuyu siler.
 * Var olan etiketler yazarken önerilir.
 */
export function TagInput({ value, onChange, className, placeholder = "Etiket ekle" }: { value: string[]; onChange: (v: string[]) => void; className?: string; placeholder?: string }) {
  const all = useAllTags();
  const [text, setText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  const q = normalizeTag(text);
  const suggestions = all.filter((t) => !value.includes(t) && (!q || t.includes(q))).slice(0, 6);
  const canCreate = q && !value.includes(q) && !all.includes(q);
  const options = [...suggestions, ...(canCreate ? [q] : [])];

  const add = (t: string) => {
    const tag = normalizeTag(t);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setText("");
    setActive(0);
  };

  return (
    <Popover open={open && options.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn("flex min-h-8 flex-wrap items-center gap-1.5 rounded-md", className)}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((t) => <TagChip key={t} tag={t} onRemove={() => onChange(value.filter((x) => x !== t))} />)}
          <div className="flex min-w-24 flex-1 items-center gap-1 text-ink-subtle">
            {!value.length && <Plus className="size-3.5 shrink-0" aria-hidden />}
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  if (!text.trim() && e.key === "Enter") return;
                  e.preventDefault();
                  add(options[active] && open ? options[active] : text);
                } else if (e.key === "Backspace" && !text && value.length) {
                  onChange(value.slice(0, -1));
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(options.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={value.length ? "" : placeholder}
              aria-label="Etiket ekle"
              role="combobox"
              aria-controls={listId}
              aria-expanded={open && options.length > 0}
              aria-autocomplete="list"
              className="h-7 w-full min-w-0 bg-transparent text-13 text-foreground outline-none placeholder:text-ink-subtle"
            />
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-56 p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
        <ul id={listId} role="listbox" aria-label="Etiket önerileri">
          {options.map((t, i) => (
            <li key={t} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(t)}
                onMouseEnter={() => setActive(i)}
                className={cn("flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-13", i === active && "bg-hover")}
              >
                {canCreate && t === q ? <><Plus className="size-3.5 text-ink-subtle" /> <span>Oluştur:</span> <TagChip tag={t} /></> : <TagChip tag={t} />}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

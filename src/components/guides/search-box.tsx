"use client";

import { Search } from "lucide-react";

/** Rehber sekmelerindeki arama kutusu */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-line bg-surface px-2.5 focus-within:border-ring sm:w-64">
      <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle" />
    </label>
  );
}

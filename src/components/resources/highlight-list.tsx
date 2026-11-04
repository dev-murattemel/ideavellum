"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { Pencil, Quote, Search } from "lucide-react";

import type { CourseColor } from "@/lib/course-colors";
import type { Highlight } from "@/lib/data/types";
import { searchKey } from "@/lib/catalog";
import { byPage } from "@/lib/domain/highlights";
import { fmt } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Kitabın alıntıları: arama, renge göre süzme; her alıntı fosforlu kalemle çizilmiş gibi */
export function HighlightList({ items, resourceId }: { items: Highlight[]; resourceId: string }) {
  const [query, setQuery] = React.useState("");
  const [color, setColor] = React.useState<CourseColor | null>(null);
  const q = searchKey(query);
  const used = [...new Set(items.map((h) => h.color))];
  const shown = items
    .filter((h) => (!color || h.color === color) && (!q || searchKey(`${h.text} ${h.note ?? ""} ${h.tags.join(" ")}`).includes(q)))
    .sort(byPage);

  if (!items.length) {
    return (
      <button
        type="button"
        onClick={() => ui().open({ type: "highlight", resourceId })}
        className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-line-strong px-4 py-5 text-left transition-colors hover:bg-hover/60"
      >
        <span className="flex items-center gap-2 text-sm font-medium"><Quote className="size-4" aria-hidden /> İlk alıntını ekle</span>
        <span className="text-13 text-ink-muted">Altını çizdiğin cümleyi, sayfasını ve kendi notunu yaz; hepsi burada toplanır.</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-surface px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Alıntılarda ara" aria-label="Alıntılarda ara" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-subtle" />
        </label>
        {used.length > 1 && (
          <div role="group" aria-label="Renge göre süz" className="flex items-center gap-1">
            {used.map((c) => (
              <button
                key={c}
                type="button"
                data-course={c}
                aria-pressed={color === c}
                aria-label={`Yalnızca bu renkteki alıntılar`}
                onClick={() => setColor(color === c ? null : c)}
                className={cn("size-5 cursor-pointer rounded-full bg-course-solid ring-offset-2 ring-offset-surface outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring", color === c && "ring-2 ring-foreground/70", color && color !== c && "opacity-40")}
              />
            ))}
          </div>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="py-4 text-13 text-ink-muted">Aramana uyan alıntı yok.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {shown.map((h) => <HighlightCard key={h.id} h={h} />)}
        </ul>
      )}
    </div>
  );
}

function HighlightCard({ h }: { h: Highlight }) {
  return (
    <li data-course={h.color} className="group relative flex gap-3 rounded-xl border border-line bg-surface p-3.5">
      <span className="tabular w-10 shrink-0 pt-0.5 text-xs text-ink-muted">{h.page != null ? `s. ${h.page}` : "–"}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-7">
        {h.text && (
          <p className="text-sm leading-6">
            <mark className="box-decoration-clone rounded-[3px] bg-course px-0.5 text-foreground">{h.text}</mark>
          </p>
        )}
        {h.note && <p className={cn("text-13 leading-5 whitespace-pre-line text-ink-muted", !h.text && "text-foreground")}>{h.note}</p>}
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-subtle">
          <span>{fmt(parseISO(h.created_at), "d MMM yyyy")}</span>
          {h.tags.map((t) => <span key={t}>#{t}</span>)}
        </p>
      </div>
      <button
        type="button"
        aria-label="Alıntıyı düzenle"
        onClick={() => ui().open({ type: "highlight", resourceId: h.resource_id, highlightId: h.id })}
        className="absolute top-2.5 right-2.5 flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-hover hover:text-foreground focus-visible:opacity-100 max-sm:opacity-100"
      >
        <Pencil className="size-3.5" />
      </button>
    </li>
  );
}

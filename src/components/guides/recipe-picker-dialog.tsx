"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchKey } from "@/lib/catalog";
import { DIET_STYLES, RECIPES, recipeChecks, recipeDetails, recipeStyles, styleInfo, type Recipe } from "@/lib/guides";
import { getEntry, saveEntry } from "@/lib/domain/session-entries";
import { FilterChips } from "./filter-chips";
import { RecipeCover } from "./recipe-cover";
import { SearchBox } from "./search-box";

/** Gün panelinden "Rehberden tarif seç": seçilen tarif o güne uygulanır */
export function RecipePickerDialog({ sessionId, date, onClose }: { sessionId: string; date: string; onClose: () => void }) {
  const [style, setStyle] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const q = searchKey(query);
  const shown = RECIPES.filter((r) => (style === "all" || recipeStyles(r).includes(style as never)) && (!q || searchKey(`${r.name} ${r.ingredients.map((i) => i.name).join(" ")}`).includes(q)));

  const apply = (r: Recipe) => {
    const e = getEntry(sessionId, date);
    saveEntry(sessionId, date, {
      title: e?.title || r.name,
      checklist: [...(e?.checklist ?? []), ...recipeChecks(r)],
      details: [e?.details, recipeDetails(r)].filter(Boolean).join("\n\n"),
    });
    toast.success(`${r.name} bu güne eklendi`, { description: `${r.ingredients.length} malzeme listeye, yapılışı ayrıntılara yazıldı.` });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Rehberden tarif seç</DialogTitle>
          <DialogDescription>Malzemeler bu günün listesine, yapılışı ayrıntılara eklenir.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <SearchBox value={query} onChange={setQuery} placeholder="Tarif ya da malzeme ara" />
          <FilterChips label="Beslenme stili" value={style} onChange={setStyle} chips={[{ key: "all", label: "Tümü" }, ...DIET_STYLES.map((d) => ({ key: d.key, label: d.label, color: d.color }))]} />
        </div>
        <ul className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2">
          {shown.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => apply(r)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RecipeCover recipe={r} className="size-14 shrink-0 rounded-lg [&_span.size-16]:size-9 [&_svg]:size-5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.name}</span>
                  <span className="tabular block truncate text-xs text-ink-muted">{styleInfo(r.style).label} · {r.minutes} dk · {r.kcal} kcal · {r.protein} g protein</span>
                </span>
              </button>
            </li>
          ))}
          {!shown.length && <li className="py-8 text-center text-13 text-ink-muted">Aramaya uyan tarif yok.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { SearchX } from "lucide-react";

import { searchKey } from "@/lib/catalog";
import { DIET_STYLES, MEALS, RECIPES, recipeStyles, type Meal } from "@/lib/guides";
import { FilterChips } from "./filter-chips";
import { RecipeCard } from "./recipe-card";
import { SearchBox } from "./search-box";

/** Tarifler: beslenme stiline ve öğüne göre süzülen kartlar */
export function RecipesTab() {
  const [style, setStyle] = React.useState("all");
  const [meal, setMeal] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const q = searchKey(query);

  const byStyle = (s: string) => RECIPES.filter((r) => s === "all" || recipeStyles(r).includes(s as never));
  const shown = byStyle(style).filter(
    (r) => (meal === "all" || r.meal === meal) && (!q || searchKey(`${r.name} ${r.summary} ${r.ingredients.map((i) => i.name).join(" ")}`).includes(q)),
  );
  const active = DIET_STYLES.find((d) => d.key === style);

  return (
    <div className="flex flex-col gap-5">
      <FilterChips
        label="Beslenme stili"
        value={style}
        onChange={setStyle}
        chips={[{ key: "all", label: "Tümü", count: RECIPES.length }, ...DIET_STYLES.map((d) => ({ key: d.key, label: d.label, count: byStyle(d.key).length, color: d.color }))]}
      />
      {active && (
        <p data-course={active.color} className="rounded-lg bg-course px-3 py-2 text-13 text-course-fg">
          <span className="font-semibold">{active.label}:</span> {active.text}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Öğün"
          value={meal}
          onChange={setMeal}
          chips={[{ key: "all", label: "Tüm öğünler" }, ...(Object.keys(MEALS) as Meal[]).map((m) => ({ key: m, label: MEALS[m].label }))]}
        />
        <SearchBox value={query} onChange={setQuery} placeholder="Tarif ya da malzeme ara" />
      </div>
      {shown.length ? (
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {shown.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong py-12 text-center">
          <SearchX className="size-5 text-ink-subtle" aria-hidden />
          <p className="text-13 text-ink-muted">Bu süzgeçlere uyan tarif yok. Aramayı ya da öğünü değiştir.</p>
        </div>
      )}
    </div>
  );
}

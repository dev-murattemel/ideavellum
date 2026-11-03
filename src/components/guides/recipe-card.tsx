"use client";

import { Clock3, Dumbbell, Flame } from "lucide-react";

import { MEALS, styleInfo, type Recipe } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { RecipeCover } from "./recipe-cover";

/** Tarif kartı: kapak, ad, öğün ve stil, süre · kalori · protein */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const style = styleInfo(recipe.style);
  return (
    <button
      type="button"
      onClick={() => ui().openGuide({ type: "recipe", id: recipe.id })}
      className="lift group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-line bg-surface text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <RecipeCover recipe={recipe} className="aspect-[2/1]" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span data-course={style.color} className="rounded-md bg-course px-1.5 py-0.5 font-medium text-course-fg">{style.label}</span>
          <span className="text-ink-muted">{MEALS[recipe.meal].label}</span>
        </div>
        <h3 className="text-sm leading-5 font-semibold">{recipe.name}</h3>
        <p className="line-clamp-2 text-13 text-ink-muted">{recipe.summary}</p>
        <p className="tabular mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-ink-muted">
          <span className="flex items-center gap-1"><Clock3 className="size-3.5" aria-hidden />{recipe.minutes} dk</span>
          <span className="flex items-center gap-1"><Flame className="size-3.5" aria-hidden />{recipe.kcal} kcal</span>
          <span className="flex items-center gap-1"><Dumbbell className="size-3.5" aria-hidden />{recipe.protein} g protein</span>
        </p>
      </div>
    </button>
  );
}

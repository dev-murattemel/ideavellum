"use client";

import { ARTICLES, exerciseGuide, recipeById } from "@/lib/guides";
import { useUI } from "@/lib/ui-store";
import { ArticleSheet } from "./article-sheet";
import { ExerciseSheet } from "./exercise-sheet";
import { RecipeSheet } from "./recipe-sheet";

/** Rehber ayrıntı panelleri tek yerden açılır (Rehber sayfası, gün paneli) */
export function GuideSheetHost() {
  const guide = useUI((s) => s.guide);
  if (!guide) return null;
  if (guide.type === "recipe") {
    const r = recipeById(guide.id);
    return r ? <RecipeSheet key={r.id} recipe={r} /> : null;
  }
  if (guide.type === "exercise") {
    const g = exerciseGuide(guide.id);
    return g ? <ExerciseSheet key={g.name} guide={g} /> : null;
  }
  const a = ARTICLES.find((x) => x.id === guide.id);
  return a ? <ArticleSheet key={a.id} article={a} /> : null;
}

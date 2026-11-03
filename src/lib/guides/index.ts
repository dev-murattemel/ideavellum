import { searchKey } from "@/lib/catalog";
import type { EntryCheck } from "@/lib/data/types";
import { newCheck } from "@/lib/domain/session-entries";
import { ARTICLES } from "./articles";
import { EXERCISE_GUIDES } from "./exercises";
import { LIGHT_RECIPES } from "./recipes-light";
import { LOWCARB_RECIPES } from "./recipes-lowcarb";
import { MEDITERRANEAN_RECIPES } from "./recipes-mediterranean";
import { PROTEIN_RECIPES } from "./recipes-protein";
import { VEGETARIAN_RECIPES } from "./recipes-vegetarian";
import { DIET_STYLES, MEALS, type DietStyle, type ExerciseGuide, type Recipe } from "./types";

export * from "./types";
export { ARTICLES, EXERCISE_GUIDES };
export { GUIDE_GROUPS } from "./exercises";

export const RECIPES: Recipe[] = [
  ...PROTEIN_RECIPES,
  ...MEDITERRANEAN_RECIPES,
  ...VEGETARIAN_RECIPES,
  ...LOWCARB_RECIPES,
  ...LIGHT_RECIPES,
];

const RECIPE_BY_ID = new Map(RECIPES.map((r) => [r.id, r]));
const GUIDE_BY_KEY = new Map(EXERCISE_GUIDES.map((g) => [searchKey(g.name), g]));

export const recipeById = (id: string) => RECIPE_BY_ID.get(id);
/** Listedeki hareket adından rehberini bulur ("bench press" → Bench press) */
export const exerciseGuide = (name: string): ExerciseGuide | undefined => GUIDE_BY_KEY.get(searchKey(name));
export const styleInfo = (s: DietStyle) => DIET_STYLES.find((d) => d.key === s)!;
export const recipeStyles = (r: Recipe) => [r.style, ...(r.also ?? [])];

/** Tarif malzemeleri → günün listesi (miktar + birim) */
export const recipeChecks = (r: Recipe): EntryCheck[] =>
  r.ingredients.map((i) =>
    newCheck(i.note ? `${i.name} (${i.note})` : i.name, { metric: "amount", amount: i.amount ?? null, unit: i.unit ?? null }),
  );

/** Tarifin yapılışı → günün ayrıntı metni */
export const recipeDetails = (r: Recipe) =>
  [
    `${r.name} · ${r.servings} porsiyon · ${r.minutes} dk`,
    "",
    ...r.steps.map((s, i) => `${i + 1}. ${s}`),
    ...(r.tip ? ["", `İpucu: ${r.tip}`] : []),
  ].join("\n");

/** Hareket rehberi → günün listesine madde (önerilen set × tekrar ya da süre) */
export const exerciseCheck = (g: ExerciseGuide): EntryCheck =>
  g.minutes
    ? newCheck(g.name, { metric: "cardio", minutes: g.minutes, km: null })
    : newCheck(g.name, { metric: "strength", sets: g.sets ?? 3, reps: g.reps ?? 10, weight: null });

export const mealTimes = (r: Recipe) => MEALS[r.meal];

/** Videoyu YouTube'da aratır (telif nedeniyle video gömülmez) */
export const videoSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

import type { CourseColor } from "@/lib/course-colors";

export type DietStyle = "high-protein" | "mediterranean" | "vegetarian" | "low-carb" | "light";
export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export type RecipeIcon =
  | "beef" | "fish" | "salad" | "egg" | "egg-fried" | "soup" | "drumstick" | "wheat" | "sandwich"
  | "pot" | "carrot" | "apple" | "leaf" | "milk" | "citrus" | "cherry" | "shrimp" | "bean" | "sprout" | "nut";

export type Ingredient = { name: string; amount?: number; unit?: string; note?: string };

export type Recipe = {
  id: string;
  name: string;
  style: DietStyle;
  /** Uyduğu diğer stiller (ör. hem yüksek protein hem düşük karbonhidrat) */
  also?: DietStyle[];
  meal: Meal;
  minutes: number;
  servings: number;
  /** Porsiyon başına yaklaşık değerler */
  kcal: number;
  protein: number;
  icon: RecipeIcon;
  summary: string;
  ingredients: Ingredient[];
  steps: string[];
  tip?: string;
};

export type DietStyleInfo = { key: DietStyle; label: string; color: CourseColor; text: string };

export const DIET_STYLES: DietStyleInfo[] = [
  { key: "high-protein", label: "Yüksek protein", color: "peach", text: "Kas gelişimi ve tokluk için öğün başına 30 g ve üstü protein." },
  { key: "mediterranean", label: "Akdeniz", color: "sky", text: "Zeytinyağı, sebze, balık, baklagil; kalp dostu ve dengeli." },
  { key: "vegetarian", label: "Vejetaryen", color: "mint", text: "Et yok; protein baklagil, yumurta ve süt ürünlerinden." },
  { key: "low-carb", label: "Düşük karbonhidrat", color: "lavender", text: "Ekmek, pirinç ve şeker az; sebze, protein ve iyi yağ çok." },
  { key: "light", label: "Hafif", color: "butter", text: "Düşük kalorili, doyurucu ve sindirimi kolay tabaklar." },
];

export const MEALS: Record<Meal, { label: string; start: string; end: string }> = {
  breakfast: { label: "Kahvaltı", start: "08:00", end: "08:30" },
  lunch: { label: "Öğle", start: "13:00", end: "13:45" },
  dinner: { label: "Akşam", start: "19:00", end: "20:00" },
  snack: { label: "Ara öğün", start: "16:00", end: "16:15" },
};

export type ExerciseLevel = "Başlangıç" | "Orta" | "İleri";

export type ExerciseGuide = {
  /** Hazır hareket listesindeki adla aynı */
  name: string;
  group: string;
  muscles: string[];
  equipment: string;
  level: ExerciseLevel;
  /** Hazırlık ve hareketin adımları */
  steps: string[];
  /** Duruş ve form ipuçları */
  cues: string[];
  mistakes: string[];
  /** Önerilen set × tekrar ya da süre */
  sets?: number;
  reps?: number;
  minutes?: number;
};

export type Article = {
  id: string;
  topic: string;
  title: string;
  summary: string;
  color: CourseColor;
  steps: string[];
  tips: string[];
};

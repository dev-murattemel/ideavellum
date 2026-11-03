"use client";

import { ChefHat, Dumbbell, Lightbulb } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ARTICLES, EXERCISE_GUIDES, RECIPES } from "@/lib/guides";
import { useUI, type GuideTab } from "@/lib/ui-store";
import { ArticlesTab } from "./articles-tab";
import { ExercisesTab } from "./exercises-tab";
import { RecipesTab } from "./recipes-tab";

const TABS: { id: GuideTab; label: string; icon: React.ElementType; count: number }[] = [
  { id: "recipes", label: "Tarifler", icon: ChefHat, count: RECIPES.length },
  { id: "exercises", label: "Hareketler", icon: Dumbbell, count: EXERCISE_GUIDES.length },
  { id: "articles", label: "Yöntemler", icon: Lightbulb, count: ARTICLES.length },
];

/** Rehber: tarifler, hareketler ve yöntemler; buradan takvime eklenir */
export function GuideView() {
  const tab = useUI((s) => s.guideTab);
  const setTab = useUI((s) => s.setGuideTab);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Rehber</h1>
        <p className="text-sm text-ink-muted">Beslenme stiline göre tarifler, hareketlerin doğru yapılışı ve çalışma yöntemleri. Beğendiğini tek tıkla takvimine ekle.</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as GuideTab)} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <TabsList aria-label="Rehber bölümleri">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <TabsTrigger key={id} value={id} className="gap-2">
              <Icon className="size-4" aria-hidden />{label}
              <span className="tabular text-xs text-ink-subtle">{count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {tab === "recipes" ? <RecipesTab /> : tab === "exercises" ? <ExercisesTab /> : <ArticlesTab />}
    </div>
  );
}

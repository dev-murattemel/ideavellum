"use client";

import { CalendarPlus, CirclePlay, Clock3, Dumbbell, Flame, Lightbulb, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MEALS, recipeChecks, recipeDetails, recipeStyles, styleInfo, videoSearch, type Recipe } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { fmtAmount, GuideSection, GuideSheetFrame, Steps } from "./guide-sheet-frame";
import { RecipeCover } from "./recipe-cover";

/** Tarif ayrıntısı: malzemeler, yapılış, video ve "Takvime ekle" */
export function RecipeSheet({ recipe: r }: { recipe: Recipe }) {
  const addToCalendar = () => {
    const meal = MEALS[r.meal];
    ui().openGuide(null);
    ui().open({
      type: "add-to-day",
      payload: { kind: "cooking", name: r.name, title: r.name, checks: recipeChecks(r), details: recipeDetails(r), start: meal.start, end: meal.end },
    });
  };
  const meta = [
    { icon: Clock3, text: `${r.minutes} dk` },
    { icon: Users, text: `${r.servings} porsiyon` },
    { icon: Flame, text: `${r.kcal} kcal` },
    { icon: Dumbbell, text: `${r.protein} g protein` },
  ];

  return (
    <GuideSheetFrame
      title={r.name}
      description={r.summary}
      hero={<RecipeCover recipe={r} size="lg" className="h-48" />}
      footer={
        <>
          <Button variant="secondary" asChild>
            <a href={videoSearch(`${r.name} tarifi`)} target="_blank" rel="noreferrer"><CirclePlay /> Videosunu izle</a>
          </Button>
          <Button onClick={addToCalendar}><CalendarPlus /> Takvime ekle</Button>
        </>
      }
    >
      <div className="-mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {recipeStyles(r).map((s) => (
            <span key={s} data-course={styleInfo(s).color} className="rounded-md bg-course px-1.5 py-0.5 font-medium text-course-fg">{styleInfo(s).label}</span>
          ))}
          <span className="ml-1 text-ink-muted">{MEALS[r.meal].label}</span>
        </div>
        <p className="text-sm text-ink-muted">{r.summary}</p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {meta.map(({ icon: Icon, text }) => (
            <li key={text} className="tabular flex items-center gap-2 rounded-lg bg-sunken/60 px-3 py-2 text-13 font-medium">
              <Icon className="size-4 text-ink-subtle" aria-hidden />{text}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-subtle">Değerler porsiyon başına yaklaşıktır.</p>
      </div>

      <GuideSection title={`Malzemeler · ${r.ingredients.length}`}>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {r.ingredients.map((i) => (
            <li key={i.name} className="flex items-baseline justify-between gap-3 px-3.5 py-2.5 text-sm">
              <span>{i.name}{i.note && <span className="text-ink-muted"> · {i.note}</span>}</span>
              <span className="tabular shrink-0 text-ink-muted">{fmtAmount(i.amount)} {i.unit}</span>
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection title="Yapılışı">
        <Steps steps={r.steps} />
      </GuideSection>

      {r.tip && (
        <p className="flex gap-2.5 rounded-xl bg-sunken/60 p-3.5 text-13">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
          <span><span className="font-medium">İpucu:</span> {r.tip}</span>
        </p>
      )}
    </GuideSheetFrame>
  );
}

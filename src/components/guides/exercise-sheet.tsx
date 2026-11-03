"use client";

import { CalendarPlus, CircleAlert, CircleCheck, CirclePlay, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exerciseCheck, videoSearch, type ExerciseGuide } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { ExerciseVisual } from "./exercise-visual";
import { GuideSection, GuideSheetFrame, Steps } from "./guide-sheet-frame";

const suggestion = (g: ExerciseGuide) => (g.minutes ? `${g.minutes} dakika` : `${g.sets ?? 3} set × ${g.reps ?? 10} tekrar`);

/** Hareket ayrıntısı: nasıl yapılır, duruş ipuçları, sık hatalar, video, "Antrenmana ekle" */
export function ExerciseSheet({ guide: g }: { guide: ExerciseGuide }) {
  const add = () => {
    ui().openGuide(null);
    ui().open({ type: "add-to-day", payload: { kind: "fitness", name: g.name, checks: [exerciseCheck(g)], start: "18:00", end: "19:00" } });
  };
  return (
    <GuideSheetFrame
      title={g.name}
      description={`${g.name}: nasıl yapılır`}
      hero={<ExerciseVisual group={g.group} size="lg" className="h-40" />}
      footer={
        <>
          <Button variant="secondary" asChild>
            <a href={videoSearch(`${g.name} doğru form nasıl yapılır`)} target="_blank" rel="noreferrer"><CirclePlay /> Videoda izle</a>
          </Button>
          <Button onClick={add}><CalendarPlus /> Antrenmana ekle</Button>
        </>
      }
    >
      <dl className="-mt-3 grid grid-cols-2 gap-2 text-13 sm:grid-cols-4">
        {[
          ["Grup", g.group],
          ["Seviye", g.level],
          ["Öneri", suggestion(g)],
          ["Ekipman", g.equipment],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 rounded-lg bg-sunken/60 px-3 py-2">
            <dt className="text-xs text-ink-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-1.5">
        {g.muscles.map((m) => (
          <span key={m} className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-muted">{m}</span>
        ))}
      </div>

      <GuideSection title="Nasıl yapılır">
        <Steps steps={g.steps} />
      </GuideSection>

      <GuideSection title="Duruş ve form">
        <ul className="flex flex-col gap-2">
          {g.cues.map((c) => (
            <li key={c} className="flex gap-2.5 text-sm"><CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{c}</li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection title="Sık yapılan hatalar">
        <ul className="flex flex-col gap-2">
          {g.mistakes.map((m) => (
            <li key={m} className="flex gap-2.5 text-sm"><CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />{m}</li>
          ))}
        </ul>
      </GuideSection>

      <p className="flex gap-2.5 rounded-xl bg-sunken/60 p-3.5 text-13 text-ink-muted">
        <Wrench className="mt-0.5 size-4 shrink-0" aria-hidden />
        Ağrı hissedersen dur. Yeni başlıyorsan ilk haftalarda hafif ağırlıkla formu oturt; sağlık sorunun varsa bir uzmana danış.
      </p>
    </GuideSheetFrame>
  );
}

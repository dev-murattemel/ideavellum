"use client";

import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/guides";
import { useUI } from "@/lib/ui-store";
import { GuideSection, GuideSheetFrame, Steps } from "./guide-sheet-frame";

/** Yöntem yazısı: adımlar ve ipuçları */
export function ArticleSheet({ article: a }: { article: Article }) {
  const openGuide = useUI((s) => s.openGuide);
  return (
    <GuideSheetFrame
      title={a.title}
      description={a.summary}
      hero={
        <div data-course={a.color} className="relative h-28 overflow-hidden bg-course px-6 pt-6 text-course-fg">
          <span aria-hidden className="absolute -top-10 -right-10 size-36 rounded-full border-[20px] border-course-solid/15" />
          <span className="rounded-md bg-surface/70 px-2 py-1 text-xs font-medium">{a.topic}</span>
        </div>
      }
      footer={<Button variant="secondary" onClick={() => openGuide(null)}>Kapat</Button>}
    >
      <p className="-mt-3 text-sm text-ink-muted">{a.summary}</p>
      <GuideSection title="Adımlar">
        <Steps steps={a.steps} />
      </GuideSection>
      <GuideSection title="İpuçları">
        <ul className="flex flex-col gap-2">
          {a.tips.map((t) => (
            <li key={t} className="flex gap-2.5 rounded-lg bg-sunken/60 p-3 text-13">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />{t}
            </li>
          ))}
        </ul>
      </GuideSection>
    </GuideSheetFrame>
  );
}

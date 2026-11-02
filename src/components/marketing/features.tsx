import { BellRing, CalendarRange, KanbanSquare, NotebookPen, Repeat2, Timer } from "lucide-react";

import type { Copy } from "@/lib/marketing/copy";
import { SectionHead } from "./section-head";

const ICONS = [CalendarRange, BellRing, KanbanSquare, NotebookPen, Timer, Repeat2];
const COLORS = ["sky", "butter", "lavender", "mint", "peach", "rose"] as const;

/** Özellik ızgarası: altı kart */
export function Features({ t }: { t: Copy }) {
  return (
    <section id="features" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead title={t.features.title} lead={t.features.lead} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <li key={f.title} className="lift rounded-xl border border-line bg-surface p-6">
                <span data-course={COLORS[i]} className="flex size-10 items-center justify-center rounded-lg bg-course text-course-fg">
                  <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{f.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import { Check } from "lucide-react";

import type { Copy } from "@/lib/marketing/copy";
import { cn } from "@/lib/utils";
import { ShotFrame } from "./shot-frame";

/** Ekran görüntülü anlatım satırları; sıra sağ/sol değişir */
export function Showcase({ t }: { t: Copy }) {
  return (
    <section className="border-y border-line bg-surface/50 py-20 md:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-20 px-4 sm:px-6 md:gap-28">
        {t.showcase.map((s, i) => (
          <article key={s.title} className={cn("grid items-center gap-8 lg:gap-14", i % 2 === 1 ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]")}>
            <div className={cn("flex flex-col gap-4", i % 2 === 1 && "lg:order-2")}>
              <p className="text-13 font-medium text-ink-subtle">{s.eyebrow}</p>
              <h3 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] sm:text-[30px]">{s.title}</h3>
              <p className="text-base text-ink-muted">{s.text}</p>
              <ul className="mt-2 flex flex-col gap-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <ShotFrame src={s.image} alt={s.alt} className={cn(i % 2 === 1 && "lg:order-1")} />
          </article>
        ))}
      </div>
    </section>
  );
}

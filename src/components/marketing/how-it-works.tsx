import type { Copy } from "@/lib/marketing/copy";
import { SectionHead } from "./section-head";

/** Üç adımda kullanım */
export function HowItWorks({ t }: { t: Copy }) {
  return (
    <section id="how" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead title={t.how.title} />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {t.how.steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6">
              <span className="tabular flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { Plus } from "lucide-react";

import type { Copy } from "@/lib/marketing/copy";
import { SectionHead } from "./section-head";

/** Sık sorulanlar; tarayıcının kendi açılır kapanır öğesiyle (JS gerektirmez) */
export function Faq({ t }: { t: Copy }) {
  return (
    <section id="faq" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-[760px] px-4 sm:px-6">
        <SectionHead title={t.faq.title} />
        <div className="mt-10 divide-y divide-line rounded-xl border border-line bg-surface">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {f.q}
                <Plus className="size-4 shrink-0 text-ink-subtle transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
              </summary>
              <p className="pb-5 text-sm text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/marketing/copy";
import { ShotFrame } from "./shot-frame";

const AREA_COLORS = ["sky", "lavender", "mint", "peach", "butter", "rose", "sage", "slate"] as const;

/** Açılış bölümü: başlık, iki eylem, ana ekran görüntüsü ve alan örnekleri */
export function Hero({ t }: { t: Copy }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 pt-16 text-center sm:px-6 md:pt-24">
        <p className="page-in rounded-full border border-line bg-surface px-3 py-1 text-13 text-ink-muted">{t.hero.badge}</p>
        <h1 className="page-in mt-6 max-w-[14ch] text-[40px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[56px] md:text-[68px]">
          {t.hero.title}
        </h1>
        <p className="page-in mt-6 max-w-[620px] text-base text-pretty text-ink-muted sm:text-lg sm:leading-7">{t.hero.lead}</p>
        <div className="page-in mt-8 flex w-full max-w-[320px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Button asChild size="lg" className="h-11 px-5 text-[15px]">
            <Link href="/giris">
              {t.hero.primary} <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-11 px-5 text-[15px]">
            <a href="#how">{t.hero.secondary}</a>
          </Button>
        </div>
        <p className="mt-4 text-13 text-ink-subtle">{t.hero.note}</p>
      </div>

      <div className="mx-auto mt-14 max-w-[1200px] px-4 sm:px-6">
        <ShotFrame src="/marketing/today.webp" alt={t.hero.alt} priority />
      </div>

      <div className="mx-auto mt-16 flex max-w-[1200px] flex-col items-center gap-5 px-4 sm:px-6">
        <p className="text-sm font-medium text-ink-muted">{t.areas.title}</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {t.areas.items.map((a, i) => (
            <li key={a} data-course={AREA_COLORS[i % AREA_COLORS.length]} className="rounded-full bg-course px-3 py-1 text-13 font-medium text-course-fg">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

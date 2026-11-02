import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/marketing/copy";
import type { Lang } from "@/lib/marketing/lang";
import { Faq } from "./faq";
import { Features } from "./features";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Pricing } from "./pricing";
import { Showcase } from "./showcase";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Tanıtım sayfası: giriş yapmamış ziyaretçinin gördüğü "/" */
export function LandingPage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <div lang={lang} className="min-h-dvh bg-page">
      <SiteHeader t={t} lang={lang} home />
      <main>
        <Hero t={t} />
        <Features t={t} />
        <Showcase t={t} />
        <HowItWorks t={t} />
        <Pricing lang={lang} />
        <Faq t={t} />
        <section className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-[36px]">{t.cta.title}</h2>
            <p className="text-base opacity-70">{t.cta.text}</p>
            <Button asChild size="lg" variant="secondary" className="mt-2 h-11 border-transparent px-5 text-[15px]">
              <Link href="/giris">
                {t.cta.button} <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter t={t} lang={lang} />
    </div>
  );
}

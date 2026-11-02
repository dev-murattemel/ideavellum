import { COPY } from "@/lib/marketing/copy";
import type { Lang } from "@/lib/marketing/lang";
import { LEGAL, type LegalKey } from "@/lib/marketing/legal";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

/** Gizlilik, koşullar ve iade sayfalarının ortak düzeni */
export function LegalPage({ doc, lang }: { doc: LegalKey; lang: Lang }) {
  const t = COPY[lang];
  const docs = LEGAL[lang];
  const d = docs[doc];
  const fill = (s: string) => {
    const parts = s.split("{contact}");
    return parts.flatMap((part, i) =>
      i === 0 ? [part] : [SUPPORT ? <a key={i} href={`mailto:${SUPPORT}`} className="font-medium text-foreground underline underline-offset-4">{SUPPORT}</a> : docs.contactFallback, part],
    );
  };

  return (
    <div lang={lang} className="min-h-dvh bg-page">
      <SiteHeader t={t} lang={lang} />
      <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 md:py-20">
        <p className="text-13 text-ink-subtle">{docs.updated}</p>
        <h1 className="mt-3 text-[32px] leading-tight font-semibold tracking-[-0.025em] sm:text-[40px]">{d.title}</h1>
        <p className="mt-4 text-base text-ink-muted">{d.intro}</p>
        <div className="mt-10 flex flex-col gap-9">
          {d.sections.map((s) => (
            <section key={s.h} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.01em]">{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i} className="text-[15px] leading-7 text-ink-muted">{fill(p)}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter t={t} lang={lang} path={`/${doc}`} />
    </div>
  );
}

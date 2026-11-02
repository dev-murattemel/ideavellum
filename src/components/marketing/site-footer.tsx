import Link from "next/link";

import { BrandMark } from "@/components/layout/brand";
import type { Copy } from "@/lib/marketing/copy";
import { withLang, type Lang } from "@/lib/marketing/lang";

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const YEAR = new Date().getFullYear();

/** Tanıtım sayfalarının alt bilgisi: yasal bağlantılar ve dil değiştirici */
export function SiteFooter({ t, lang, path = "/" }: { t: Copy; lang: Lang; path?: string }) {
  const other: Lang = lang === "en" ? "tr" : "en";
  const links = [
    { href: withLang("/privacy", lang), label: t.footer.privacy },
    { href: withLang("/terms", lang), label: t.footer.terms },
    { href: withLang("/refund", lang), label: t.footer.refund },
  ];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <BrandMark className="size-6" />
          <p className="text-13 text-ink-muted">
            © {YEAR} ideavellum · {t.footer.tagline}
          </p>
        </div>
        <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-13 md:ml-auto">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="text-ink-muted transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          {SUPPORT && (
            <a href={`mailto:${SUPPORT}`} className="text-ink-muted transition-colors hover:text-foreground">
              {t.footer.contact}
            </a>
          )}
          <Link href={withLang(path, other)} hrefLang={other} className="rounded-md border border-line px-2.5 py-1 text-ink-muted transition-colors hover:border-line-strong hover:text-foreground">
            {t.footer.language}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

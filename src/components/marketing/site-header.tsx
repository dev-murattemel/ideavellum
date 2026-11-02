import Link from "next/link";

import { BrandMark, BrandWordmark } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/lib/marketing/copy";
import { withLang, type Lang } from "@/lib/marketing/lang";

/** Tanıtım sayfalarının üst çubuğu */
export function SiteHeader({ t, lang, home = false }: { t: Copy; lang: Lang; home?: boolean }) {
  const anchor = (id: string) => (home ? `#${id}` : withLang(`/#${id}`, lang));
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Link href={withLang("/", lang)} className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark className="size-7" />
          <BrandWordmark />
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {(["features", "pricing", "faq"] as const).map((k) => (
            <a key={k} href={anchor(k)} className="rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-hover hover:text-foreground">
              {t.nav[k]}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/giris">{t.nav.login}</Link>
          </Button>
          <Button asChild>
            <Link href="/giris">{t.nav.start}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

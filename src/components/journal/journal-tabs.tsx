"use client";

import { AppLink, useNav } from "@/lib/nav/nav-context";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/gunluk", label: "Günlük" },
  { href: "/aforizmalar", label: "Sözler" },
];

/** Günlük ve kendi sözlerin aynı çatı altında: üstte iki sekme */
export function JournalTabs() {
  const { pathname } = useNav();
  return (
    <nav aria-label="Günlük bölümleri" className="flex gap-1 self-start rounded-lg bg-sunken p-1">
      {TABS.map((t) => {
        const on = pathname === t.href;
        return (
          <AppLink
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cn("h-8 rounded-md px-3 text-13 leading-8 font-medium transition-colors", on ? "bg-surface text-foreground shadow-sm" : "text-ink-muted hover:text-foreground")}
          >
            {t.label}
          </AppLink>
        );
      })}
    </nav>
  );
}

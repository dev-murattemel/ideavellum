"use client";

import { ChevronRight } from "lucide-react";

import { AppLink } from "@/lib/nav/nav-context";

/** Forum › Spor › Başlık */
export function ForumCrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Konum" className="flex min-w-0 items-center gap-1 text-13 text-ink-muted">
      {items.map((it, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
          {it.href ? <AppLink href={it.href} className="truncate hover:text-foreground hover:underline">{it.label}</AppLink> : <span className="truncate text-foreground">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

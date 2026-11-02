"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/marketing/copy";
import type { Lang } from "@/lib/marketing/lang";
import { BILLING_ENABLED, PLANS, yearlySaving } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { SectionHead } from "./section-head";

type Cycle = "monthly" | "yearly";

/** Fiyat kartları; yıllık varsayılan. Ödeme açılana kadar Premium "yakında" */
export function Pricing({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  const p = t.pricing;
  const price = PLANS.premium.price[cycle];

  return (
    <section id="pricing" className="scroll-mt-20 border-y border-line bg-surface/50 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead title={p.title} lead={p.lead} />

        <div role="radiogroup" aria-label={p.title} className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-lg bg-sunken p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cycle === c}
              onClick={() => setCycle(c)}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-3 text-13 font-medium text-ink-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cycle === c && "bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]",
              )}
            >
              {p[c]}
              {c === "yearly" && <span data-course="mint" className="rounded-full bg-course px-1.5 py-px text-xs text-course-fg">{p.save(yearlySaving())}</span>}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-[880px] gap-4 md:grid-cols-2">
          <Plan name={p.free.name} tagline={p.free.tagline} items={p.free.items} amount="$0" unit="">
            <Button asChild variant="secondary" className="w-full">
              <Link href="/giris">{p.free.cta}</Link>
            </Button>
          </Plan>
          <Plan
            highlight
            name={p.premium.name}
            tagline={p.premium.tagline}
            items={p.premium.items}
            amount={`$${price}`}
            unit={cycle === "yearly" ? p.perYear : p.perMonth}
            badge={BILLING_ENABLED ? undefined : p.premium.soon}
          >
            <Button asChild className="w-full">
              <Link href="/giris">{p.premium.cta}</Link>
            </Button>
          </Plan>
        </div>
        {!BILLING_ENABLED && <p className="mx-auto mt-6 max-w-[600px] text-center text-pretty text-13 text-ink-muted">{p.early}</p>}
      </div>
    </section>
  );
}

function Plan({ name, tagline, items, amount, unit, badge, highlight, children }: {
  name: string; tagline: string; items: string[]; amount: string; unit: string; badge?: string; highlight?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-6 rounded-2xl border bg-surface p-6 sm:p-7", highlight ? "border-foreground/80 shadow-lift" : "border-line")}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{name}</h3>
          {badge && <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">{badge}</span>}
        </div>
        <p className="text-13 text-ink-muted">{tagline}</p>
      </div>
      <p className="tabular flex items-baseline gap-1.5">
        <span className="text-[40px] leading-none font-semibold tracking-[-0.03em]">{amount}</span>
        <span className="text-sm text-ink-muted">{unit}</span>
      </p>
      {children}
      <ul className="flex flex-col gap-2.5 border-t border-line pt-5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

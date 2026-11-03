"use client";

import * as React from "react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useUI } from "@/lib/ui-store";

/** Rehber ayrıntı panellerinin ortak çerçevesi: üstte görsel alan, kaydırılan gövde, altta eylemler */
export function GuideSheetFrame({ title, description, hero, footer, children }: {
  title: string;
  description: string;
  hero?: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const openGuide = useUI((s) => s.openGuide);
  return (
    <Sheet open onOpenChange={(o) => !o && openGuide(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        <div className="flex-1 overflow-y-auto">
          {hero}
          <div className="flex flex-col gap-6 p-6">
            <SheetTitle className="pr-8 text-2xl leading-8 font-semibold tracking-[-0.015em]">{title}</SheetTitle>
            {children}
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface p-4">{footer}</footer>
      </SheetContent>
    </Sheet>
  );
}

/** Başlıklı bölüm */
export function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

/** Numaralı adımlar */
export function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-sm leading-6">
          <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-ink-muted">{i + 1}</span>
          <span className="pt-px">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** "½", "1½" gibi okunur miktar */
export function fmtAmount(n?: number) {
  if (n === undefined) return "";
  const whole = Math.floor(n);
  const frac = n - whole;
  const f = Math.abs(frac - 0.5) < 0.01 ? "½" : Math.abs(frac - 0.25) < 0.01 ? "¼" : Math.abs(frac - 0.75) < 0.01 ? "¾" : frac ? String(frac).slice(1).replace(".", ",") : "";
  return `${whole || (f ? "" : "0")}${f}`;
}

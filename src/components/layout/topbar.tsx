"use client";

import { Search } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { AppLink } from "@/lib/nav/nav-context";
import { BrandMark } from "./brand";
import { useCommandMenu } from "./command-menu-context";
import { QuickAddMenu } from "./quick-add-menu";
import { TimerPill } from "./timer-pill";
import { BellButton } from "@/components/notifications/bell-button";
import { useModifierKey } from "./use-platform";

export function Topbar() {
  const { setOpen } = useCommandMenu();
  const mod = useModifierKey();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/85 backdrop-blur-md supports-[backdrop-filter]:bg-page/75">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-3 px-4 md:px-8">
        <AppLink href="/bugun" aria-label="ideavellum ana sayfa" className="rounded-md md:hidden">
          <BrandMark className="size-7" />
        </AppLink>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-line bg-surface px-3 text-left text-sm text-ink-subtle transition-colors hover:border-line-strong md:max-w-sm"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 truncate">Ara veya bir sayfaya git…</span>
          {mod && (
            <span className="hidden items-center gap-1 sm:flex" aria-hidden>
              <Kbd>{mod}</Kbd>
              <Kbd>K</Kbd>
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <TimerPill />
          <BellButton />
          <QuickAddMenu />
        </div>
      </div>
    </header>
  );
}

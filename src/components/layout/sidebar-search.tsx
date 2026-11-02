"use client";

import { Search } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCommandMenu } from "./command-menu-context";
import { useModifierKey } from "./use-platform";

/** Kenar çubuğunun üstünde arama / komut paleti (Ctrl/Cmd + K) */
export function SidebarSearch({ collapsed }: { collapsed: boolean }) {
  const { setOpen } = useCommandMenu();
  const mod = useModifierKey();

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ara"
            className="mx-auto flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors outline-none hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-[18px]" strokeWidth={1.8} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Ara {mod && <kbd className="ml-1 opacity-70">{mod}+K</kbd>}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mx-3 flex h-9 cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface/70 px-2.5 text-left text-sm text-ink-subtle transition-colors outline-none hover:border-line-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">Ara</span>
      {mod && (
        <span className="flex items-center gap-1" aria-hidden>
          <Kbd>{mod}</Kbd>
          <Kbd>K</Kbd>
        </span>
      )}
    </button>
  );
}

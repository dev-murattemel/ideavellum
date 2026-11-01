"use client";

import type { LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type RowAction = { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean; active?: boolean };

/**
 * Satırın üstüne gelince beliren hayalet düğmeler (Notion / Linear tarzı).
 * Kapsayıcıda `group` sınıfı olmalı. Dokunmatik ekranda her zaman görünür.
 */
export function RowActions({ actions, className }: { actions: RowAction[]; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-md bg-surface/90 p-0.5 opacity-0 shadow-[0_1px_3px_rgb(0_0_0/0.08)] ring-1 ring-line backdrop-blur transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
        className,
      )}
    >
      {actions.map(({ label, icon: Icon, onClick, danger, active }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }}
              className={cn(
                "flex size-7 cursor-pointer items-center justify-center rounded text-ink-muted transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                danger && "hover:bg-[#FDE4EC] hover:text-[#9C2A55] dark:hover:bg-[#E2588A]/16 dark:hover:text-[#F3A3C0]",
                active && "text-accent-text",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

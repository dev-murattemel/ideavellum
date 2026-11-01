"use client";

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataMode, useProfile } from "@/lib/data/hooks";
import { signOutClient } from "@/lib/supabase/sign-out";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const profile = useProfile();
  const mode = useDataMode();
  const name = profile.full_name ?? profile.email?.split("@")[0] ?? "Murat";
  const sub = mode === "remote" ? (profile.email ?? "") : "Önizleme · veriler bu tarayıcıda";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Hesap menüsü"
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-md p-2 text-left transition-colors outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-hover",
          collapsed && "justify-center",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-muted">
          <UserRound className="size-4" aria-hidden />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-13 font-medium text-foreground">{name}</span>
              <span className="block truncate text-xs text-ink-muted">{sub}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "end" : "start"} className="w-60">
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => applyTheme("light")}>
            <Sun /> Açık
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => applyTheme("dark")}>
            <Moon /> Koyu
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => applyTheme("system")}>
            <Monitor /> Sistemle aynı
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {mode === "remote" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOutClient()}>
              <LogOut /> Çıkış yap
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

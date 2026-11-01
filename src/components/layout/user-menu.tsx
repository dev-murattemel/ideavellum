"use client";

import { ChevronsUpDown, Download, HardDrive, LogOut, Monitor, Moon, Settings2, Sun, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlace, useProfile } from "@/lib/data/hooks";
import { shareBackup } from "@/lib/data/file-link";
import { AppLink } from "@/lib/nav/nav-context";
import { signOutClient } from "@/lib/supabase/sign-out";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const profile = useProfile();
  const place = usePlace();
  const name = profile.full_name ?? profile.email?.split("@")[0] ?? (place === "device" ? "Bu cihaz" : "Murat");
  const sub = place === "cloud" ? (profile.email ?? "") : place === "device" ? "Veriler bu cihazda" : "Önizleme · veriler bu tarayıcıda";

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
          {place === "device" ? <HardDrive className="size-4" aria-hidden /> : <UserRound className="size-4" aria-hidden />}
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
        {place === "device" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void shareBackup()}>
              <Download /> Yedeği kaydet
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AppLink href="/ayarlar"><Settings2 /> Saklama yeri ve yedek</AppLink>
            </DropdownMenuItem>
          </>
        )}
        {place === "cloud" && (
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

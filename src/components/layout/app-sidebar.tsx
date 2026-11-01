"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MAIN_NAV, SETTINGS_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { BrandMark, BrandWordmark } from "./brand";
import { SidebarNavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";
import { TermCourses } from "./term-courses";
import { UserMenu, type SidebarUser } from "./user-menu";

export function AppSidebar({ user }: { user: SidebarUser }) {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      aria-label="Ana menü"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <Link href="/bugun" aria-label="ideavellum ana sayfa" className="flex items-center gap-2.5 rounded-md">
          <BrandMark className="size-7" />
          {!collapsed && <BrandWordmark />}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label="Kenar çubuğunu daralt"
            className="ml-auto text-ink-subtle"
          >
            <PanelLeftClose className="size-[18px]" strokeWidth={1.8} />
          </Button>
        )}
      </div>

      <nav aria-label="Sayfalar" className="flex flex-col gap-0.5 px-3 pt-2">
        {MAIN_NAV.map((item) => (
          <SidebarNavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && <TermCourses />}

      <div className="mt-auto flex flex-col gap-0.5 px-3 pb-3">
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={toggle}
                aria-label="Kenar çubuğunu genişlet"
                className="h-9 w-full px-0 text-ink-subtle"
              >
                <PanelLeftOpen className="size-[18px]" strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Genişlet</TooltipContent>
          </Tooltip>
        )}
        <SidebarNavLink item={SETTINGS_NAV} collapsed={collapsed} />
        <div className="my-2 h-px bg-line" />
        <UserMenu user={user} collapsed={collapsed} />
      </div>
    </aside>
  );
}

"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_GROUPS, SETTINGS_NAV } from "@/lib/navigation";
import { AppLink } from "@/lib/nav/nav-context";
import { cn } from "@/lib/utils";
import { BrandMark, BrandWordmark } from "./brand";
import { SidebarNavLink } from "./nav-link";
import { useSidebar } from "./sidebar-context";
import { TermCourses } from "./term-courses";
import { TermBadge } from "./term-badge";
import { SidebarSearch } from "./sidebar-search";
import { UserMenu } from "./user-menu";
import { useModifierKey } from "./use-platform";

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();
  const shortcut = `${useModifierKey() ?? "Ctrl"}+B`;

  return (
    <aside
      aria-label="Ana menü"
      className={cn(
        "group/sidebar sticky top-0 hidden h-dvh shrink-0 flex-col bg-shell transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* Üst: logo + daralt/aç. Daraltılmışken logonun üstüne gelince "aç" ikonu görünür. */}
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggle}
                aria-label={`Kenar çubuğunu aç (${shortcut})`}
                className="group/open relative flex size-9 cursor-pointer items-center justify-center rounded-lg outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BrandMark className="size-7 transition-opacity group-hover/open:opacity-0 group-focus-visible/open:opacity-0" />
                <PanelLeftOpen className="absolute size-[18px] text-ink-muted opacity-0 transition-opacity group-hover/open:opacity-100 group-focus-visible/open:opacity-100" strokeWidth={1.8} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Kenar çubuğunu aç <kbd className="ml-1 opacity-70">{shortcut}</kbd></TooltipContent>
          </Tooltip>
        ) : (
          <>
            <AppLink href="/bugun" aria-label="ideavellum ana sayfa" className="flex items-center gap-2.5 rounded-md">
              <BrandMark className="size-7" />
              <BrandWordmark />
            </AppLink>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={`Kenar çubuğunu daralt (${shortcut})`} className="ml-auto text-ink-subtle">
                  <PanelLeftClose className="size-[18px]" strokeWidth={1.8} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Daralt <kbd className="ml-1 opacity-70">{shortcut}</kbd></TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      <SidebarSearch collapsed={collapsed} />
      {!collapsed && <TermBadge />}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        {NAV_GROUPS.map((group, gi) => (
          <nav key={gi} aria-label={group.label ?? "Sayfalar"} className={cn("flex flex-col gap-0.5 px-3", gi === 0 ? "pt-2" : "pt-5")}>
            {group.label &&
              (collapsed ? (
                <div className="mx-2 mb-2 h-px bg-line" aria-hidden />
              ) : (
                <h2 className="mb-1 px-2.5 text-xs font-medium text-ink-subtle">{group.label}</h2>
              ))}
            {group.items.map((item) => (
              <SidebarNavLink key={item.href} item={item} collapsed={collapsed} />
            ))}
            {gi === 0 && !collapsed && <TermCourses />}
          </nav>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 px-3 pt-2 pb-3">
        <SidebarNavLink item={SETTINGS_NAV} collapsed={collapsed} />
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Kenar şeridi: çubuğun sağ kenarına tıklayarak da açılıp kapanır */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={toggle}
        title={collapsed ? "Aç" : "Daralt"}
        className={cn(
          "absolute inset-y-0 -right-1.5 z-10 w-3 after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-primary/0 after:transition-colors hover:after:bg-primary/40",
          collapsed ? "cursor-e-resize" : "cursor-w-resize",
        )}
      />
    </aside>
  );
}

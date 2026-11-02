"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isActivePath, type NavItem } from "@/lib/navigation";
import { AppLink, useNav } from "@/lib/nav/nav-context";
import { cn } from "@/lib/utils";

export function SidebarNavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useNav();
  const active = isActivePath(pathname, item.href) || !!item.also?.some((h) => isActivePath(pathname, h));
  const Icon = item.icon;

  const link = (
    <AppLink
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-surface text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line"
          : "text-ink-muted hover:bg-surface/60 hover:text-foreground",
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-[18px] shrink-0", active ? "text-foreground" : "text-ink-subtle group-hover:text-foreground")}
        strokeWidth={active ? 2.1 : 1.8}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </AppLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

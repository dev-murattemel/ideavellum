"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MAIN_NAV,
  MOBILE_PRIMARY,
  SETTINGS_NAV,
  isActivePath,
  type NavItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

const primary = MAIN_NAV.filter((i) => MOBILE_PRIMARY.includes(i.href));
const more = [...MAIN_NAV.filter((i) => !MOBILE_PRIMARY.includes(i.href)), SETTINGS_NAV];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const moreActive = more.some((i) => isActivePath(pathname, i.href));

  return (
    <>
      <nav
        aria-label="Alt menü"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid h-16 grid-cols-5">
          {primary.map((item) => (
            <li key={item.href}>
              <TabLink item={item} active={isActivePath(pathname, item.href)} />
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-xs font-medium",
                moreActive ? "text-accent-text" : "text-ink-muted",
              )}
            >
              <TabIcon active={moreActive}>
                <Ellipsis className="size-5" strokeWidth={1.8} aria-hidden />
              </TabIcon>
              Daha fazla
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="gap-0">
          <SheetHeader className="pb-2">
            <SheetTitle>Daha fazla</SheetTitle>
            <SheetDescription className="sr-only">Diğer sayfalar</SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col p-3 pt-1">
            {more.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                      active ? "bg-accent-soft text-accent-text" : "hover:bg-hover",
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-accent-text" : "text-ink-subtle")} strokeWidth={1.8} aria-hidden />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-ink-muted">{item.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium",
        active ? "text-accent-text" : "text-ink-muted",
      )}
    >
      <TabIcon active={active}>
        <Icon className="size-5" strokeWidth={active ? 2.1 : 1.8} aria-hidden />
      </TabIcon>
      {item.shortLabel ?? item.label}
    </Link>
  );
}

function TabIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
        active && "bg-accent-soft",
      )}
    >
      {children}
    </span>
  );
}

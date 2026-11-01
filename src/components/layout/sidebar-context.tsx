"use client";

import * as React from "react";

export const SIDEBAR_COOKIE = "sidebar_collapsed";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  defaultCollapsed,
  children,
}: {
  defaultCollapsed: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      // Sunucu ilk çizimde doğru genişliği bilsin diye çerezde tutuyoruz (titreme olmaz).
      document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  // Ctrl/Cmd + B ile daralt / genişlet
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const value = React.useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);
  return <SidebarContext value={value}>{children}</SidebarContext>;
}

export function useSidebar() {
  const ctx = React.use(SidebarContext);
  if (!ctx) throw new Error("useSidebar, SidebarProvider içinde kullanılmalı.");
  return ctx;
}

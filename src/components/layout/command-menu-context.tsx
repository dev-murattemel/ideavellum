"use client";

import * as React from "react";

type CommandMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandMenuContext = React.createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <CommandMenuContext value={value}>{children}</CommandMenuContext>;
}

export function useCommandMenu() {
  const ctx = React.use(CommandMenuContext);
  if (!ctx) throw new Error("useCommandMenu, CommandMenuProvider içinde kullanılmalı.");
  return ctx;
}

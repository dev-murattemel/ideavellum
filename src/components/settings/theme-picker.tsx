"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { THEME_STORAGE_KEY, applyTheme, readTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistemle aynı", icon: Monitor },
];

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === THEME_STORAGE_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
};

export function ThemePicker() {
  const current = useSyncExternalStore(subscribe, readTheme, () => null);

  const select = (value: ThemePreference) => {
    applyTheme(value);
    listeners.forEach((l) => l());
  };

  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex rounded-lg bg-sunken p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => select(value)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-13 font-medium transition-colors",
              checked ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

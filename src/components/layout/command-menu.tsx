"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { MAIN_NAV, SETTINGS_NAV } from "@/lib/navigation";
import { useNav } from "@/lib/nav/nav-context";
import { applyTheme } from "@/lib/theme";
import { useCommandMenu } from "./command-menu-context";
import { ADD_COURSE_ACTION, QUICK_ADD_ACTIONS } from "./quick-add";

const THEMES = [
  { id: "light", label: "Açık temaya geç", icon: Sun },
  { id: "dark", label: "Koyu temaya geç", icon: Moon },
  { id: "system", label: "Sistem temasını kullan", icon: Monitor },
] as const;

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const nav = useNav();

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Sayfa ya da eylem ara…" />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup heading="Git">
          {[...MAIN_NAV, SETTINGS_NAV].map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.description}`}
                onSelect={() => run(() => nav.push(item.href))}
              >
                <Icon />
                <span>{item.label}</span>
                <span className="ml-auto truncate text-xs text-ink-subtle max-sm:hidden">
                  {item.description}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ekle">
          {[ADD_COURSE_ACTION, ...QUICK_ADD_ACTIONS].map(({ id, label, icon: Icon, run: action }) => (
            <CommandItem key={id} value={label} onSelect={() => run(action)}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Görünüm">
          {THEMES.map(({ id, label, icon: Icon }) => (
            <CommandItem key={id} value={label} onSelect={() => run(() => applyTheme(id))}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

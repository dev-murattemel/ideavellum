"use client";

import * as React from "react";

import { createNote } from "@/components/notes/create-note";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useNav } from "@/lib/nav/nav-context";
import { ACTION_SHORTCUTS, GO_SHORTCUTS, isTyping } from "@/lib/shortcuts";
import { ui, useUI } from "@/lib/ui-store";
import { useCommandMenu } from "./command-menu-context";
import { useModifierKey } from "./use-platform";

/** Linear tarzı klavye kısayolları: tek tuşla ekle, "g" + harf ile sayfaya git, "?" ile liste */
export function Shortcuts() {
  const nav = useNav();
  const { setOpen } = useCommandMenu();
  const open = useUI((s) => s.shortcutsOpen);
  const pendingG = React.useRef<number>(0);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || ui().dialog || ui().focusOpen) return;
      const k = e.key.toLowerCase();
      if (Date.now() - pendingG.current < 900) {
        const go = GO_SHORTCUTS.find((s) => s.key === k);
        pendingG.current = 0;
        if (go) {
          e.preventDefault();
          nav.push(go.href);
        }
        return;
      }
      const run: Record<string, () => void> = {
        g: () => (pendingG.current = Date.now()),
        n: () => createNote(),
        t: () => ui().open({ type: "task" }),
        a: () => ui().open({ type: "course" }),
        s: () => ui().open({ type: "quote" }),
        j: () => nav.push("/gunluk"),
        f: () => ui().setFocus(true),
        "/": () => setOpen(true),
        "?": () => ui().setShortcuts(true),
      };
      const fn = run[e.key === "?" ? "?" : k];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, setOpen]);

  return <ShortcutsDialog open={open} onOpenChange={(v) => ui().setShortcuts(v)} />;
}

function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const mod = useModifierKey() ?? "Ctrl";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Klavye kısayolları</DialogTitle>
          <DialogDescription>Yazı yazmıyorken çalışır. Fareye dokunmadan her şeye ulaş.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Group title="Ekle ve aç">
            {ACTION_SHORTCUTS.map((s) => <Row key={s.label} label={s.label} keys={[s.key === "/" ? "/" : s.key.toUpperCase()]} />)}
            <Row label="Komut paleti" keys={[mod, "K"]} />
            <Row label="Kenar çubuğu" keys={[mod, "B"]} />
          </Group>
          <Group title="Git">
            {GO_SHORTCUTS.map((s) => <Row key={s.href} label={s.label} keys={["G", s.key.toUpperCase()]} then />)}
          </Group>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="mb-1 text-xs font-medium text-ink-subtle">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, keys, then }: { label: string; keys: string[]; then?: boolean }) {
  return (
    <div className="flex h-8 items-center justify-between gap-3 rounded-md px-2 text-13 hover:bg-hover">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && then && <span className="text-[11px] text-ink-subtle">sonra</span>}
            <Kbd>{k}</Kbd>
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

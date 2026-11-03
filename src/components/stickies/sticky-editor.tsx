"use client";

import * as React from "react";

import { TagInput } from "@/components/tags/tag-input";
import { Button } from "@/components/ui/button";
import { data } from "@/lib/data/store";
import type { StickyNote } from "@/lib/data/types";
import { StickyColors } from "./sticky-colors";

/** Notun yerinde düzenlenmesi: metin, renk ve etiketler. Esc ya da "Bitti" kapatır. */
export function StickyEditor({ s, onDone }: { s: StickyNote; onDone: () => void }) {
  const [text, setText] = React.useState(s.text);
  const save = () => {
    if (text.trim() !== s.text) data().update("sticky_notes", s.id, { text: text.trim() });
    onDone();
  };
  return (
    <div data-no-drag className="flex flex-col gap-2.5">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.preventDefault(); save(); }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
        }}
        onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
        aria-label="Not metni"
        className="field-sizing-content min-h-24 w-full resize-none rounded-sm bg-surface/45 p-1.5 text-[15px] leading-6 outline-none focus:bg-surface/65"
      />
      <StickyColors size="sm" value={s.color} onChange={(color) => data().update("sticky_notes", s.id, { color })} />
      <TagInput value={s.tags} onChange={(tags) => data().update("sticky_notes", s.id, { tags })} placeholder="Etiket" className="bg-surface/55" />
      <Button size="sm" className="self-end" onClick={save}>Bitti</Button>
    </div>
  );
}

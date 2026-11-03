"use client";

import * as React from "react";
import { Pin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseColor } from "@/lib/course-colors";
import { normalizeTag } from "@/lib/tags";
import { useUI } from "@/lib/ui-store";
import { StickyColors } from "./sticky-colors";

/** "#okuma #fikir" gibi etiketleri metinden ayırır */
export function parseTags(raw: string) {
  const tags: string[] = [];
  const text = raw
    .replace(/(^|\s)#([\p{L}\p{N}_-]+)/gu, (_, sp: string, t: string) => {
      const tag = normalizeTag(t);
      if (tag && !tags.includes(tag)) tags.push(tag);
      return sp;
    })
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return { text, tags };
}

/**
 * Hızlı yazma: yaz, Enter'a bas, not panoya asılır. Shift+Enter yeni satır.
 * Metindeki #etiket'ler etikete dönüşür.
 */
export function CaptureBar({ onAdd }: { onAdd: (text: string, color: CourseColor, tags: string[]) => void }) {
  const [value, setValue] = React.useState("");
  const [color, setColor] = React.useState<CourseColor>("butter");
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const focus = useUI((s) => s.stickyFocus);
  const setFocus = useUI((s) => s.setStickyFocus);

  React.useEffect(() => {
    if (!focus) return;
    ref.current?.focus();
    setFocus(false);
  }, [focus, setFocus]);

  const submit = () => {
    const { text, tags } = parseTags(value);
    if (!text && !tags.length) return;
    onAdd(text, color, tags);
    setValue("");
    ref.current?.focus();
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      data-course={color}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center"
    >
      <span aria-hidden className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-course text-course-fg sm:flex">
        <Pin className="size-4" />
      </span>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
        }}
        placeholder="Aklına ne geldi? Yaz ve Enter’a bas. #etiket de ekleyebilirsin"
        aria-label="Yeni yapışkan not"
        className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-ink-subtle"
      />
      <div className="flex items-center justify-between gap-3">
        <StickyColors value={color} onChange={setColor} />
        <Button type="submit" disabled={!value.trim()}><Pin /> Panoya as</Button>
      </div>
    </form>
  );
}

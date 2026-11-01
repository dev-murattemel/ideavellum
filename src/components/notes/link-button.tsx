"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Link2, Link2Off } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToolButton } from "./editor-toolbar";

/** Bağlantı ekle / kaldır (tarayıcı istemi yerine küçük bir pencere) */
export function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  if (active) return <ToolButton label="Bağlantıyı kaldır" icon={Link2Off} active run={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} />;

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (raw) {
      const href = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
      const { empty } = editor.state.selection;
      const chain = editor.chain().focus();
      if (empty) chain.insertContent({ type: "text", text: raw, marks: [{ type: "link", attrs: { href } }] }).run();
      else chain.extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
    setUrl("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span><ToolButton label="Bağlantı ekle" icon={Link2} run={() => setOpen(true)} shortcut="seçili metne" /></span>
      </PopoverTrigger>
      <PopoverContent className="w-80" onOpenAutoFocus={(e) => e.preventDefault()}>
        <form onSubmit={apply} className="flex gap-2">
          <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ornek.com/makale" aria-label="Bağlantı adresi" className="h-9" />
          <Button type="submit" size="sm" className="h-9">Ekle</Button>
        </form>
        <p className="mt-2 text-xs text-ink-muted">Metin seçiliyse bağlantıya dönüşür; seçili değilse adres eklenir.</p>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold, ChevronDown, Code, CodeXml, Highlighter, Italic, List, ListChecks, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2,
  type LucideIcon,
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ImageButton } from "./image-button";
import { LinkButton } from "./link-button";

type Item = { label: string; icon: LucideIcon; active?: boolean; disabled?: boolean; run: () => void; shortcut?: string };

export function ToolButton({ label, icon: Icon, active, disabled, run, shortcut }: Item) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35",
        active && "bg-accent-soft text-accent-text hover:bg-accent-soft hover:text-accent-text",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />;

const BLOCKS = [
  { id: "p", label: "Metin" },
  { id: "h1", label: "Başlık 1" },
  { id: "h2", label: "Başlık 2" },
  { id: "h3", label: "Başlık 3" },
] as const;

/** Profesyonel biçimlendirme çubuğu: yapışkan, kaydırılabilir */
export function EditorToolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 1 }) ? "h1" : e.isActive("heading", { level: 2 }) ? "h2" : e.isActive("heading", { level: 3 }) ? "h3" : "p",
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"), strike: e.isActive("strike"),
      code: e.isActive("code"), highlight: e.isActive("highlight"), bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"),
      task: e.isActive("taskList"), quote: e.isActive("blockquote"), codeBlock: e.isActive("codeBlock"), link: e.isActive("link"),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();
  const setBlock = (id: (typeof BLOCKS)[number]["id"]) =>
    id === "p" ? c().setParagraph().run() : c().toggleHeading({ level: Number(id[1]) as 1 | 2 | 3 }).run();

  return (
    <div role="toolbar" aria-label="Biçimlendirme" className="flex items-center gap-0.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
      <ToolButton label="Geri al" icon={Undo2} disabled={!s.canUndo} run={() => c().undo().run()} shortcut="Ctrl+Z" />
      <ToolButton label="Yinele" icon={Redo2} disabled={!s.canRedo} run={() => c().redo().run()} shortcut="Ctrl+Shift+Z" />
      <Sep />
      <DropdownMenu>
        <DropdownMenuTrigger
          onMouseDown={(e) => e.preventDefault()}
          className="flex h-8 w-28 shrink-0 cursor-pointer items-center justify-between gap-1 rounded-md px-2 text-13 font-medium text-foreground outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Metin stili"
        >
          {BLOCKS.find((b) => b.id === s.block)?.label}
          <ChevronDown className="size-3.5 text-ink-subtle" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48" onCloseAutoFocus={(e) => { e.preventDefault(); editor.commands.focus(); }}>
          {BLOCKS.map((b) => (
            <DropdownMenuItem key={b.id} onSelect={() => setBlock(b.id)} className={cn(b.id === s.block && "bg-hover")}>
              <span className={cn(b.id === "h1" && "text-lg font-semibold", b.id === "h2" && "text-base font-semibold", b.id === "h3" && "font-semibold")}>{b.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Sep />
      <ToolButton label="Kalın" icon={Bold} active={s.bold} run={() => c().toggleBold().run()} shortcut="Ctrl+B" />
      <ToolButton label="İtalik" icon={Italic} active={s.italic} run={() => c().toggleItalic().run()} shortcut="Ctrl+I" />
      <ToolButton label="Altı çizili" icon={Underline} active={s.underline} run={() => c().toggleUnderline().run()} shortcut="Ctrl+U" />
      <ToolButton label="Üstü çizili" icon={Strikethrough} active={s.strike} run={() => c().toggleStrike().run()} />
      <ToolButton label="Vurgula" icon={Highlighter} active={s.highlight} run={() => c().toggleHighlight().run()} />
      <ToolButton label="Satır içi kod" icon={Code} active={s.code} run={() => c().toggleCode().run()} />
      <Sep />
      <ToolButton label="Madde listesi" icon={List} active={s.bullet} run={() => c().toggleBulletList().run()} />
      <ToolButton label="Numaralı liste" icon={ListOrdered} active={s.ordered} run={() => c().toggleOrderedList().run()} />
      <ToolButton label="Yapılacaklar" icon={ListChecks} active={s.task} run={() => c().toggleTaskList().run()} />
      <Sep />
      <ToolButton label="Alıntı" icon={Quote} active={s.quote} run={() => c().toggleBlockquote().run()} />
      <ToolButton label="Kod bloğu" icon={CodeXml} active={s.codeBlock} run={() => c().toggleCodeBlock().run()} />
      <ToolButton label="Ayırıcı çizgi" icon={Minus} run={() => c().setHorizontalRule().run()} />
      <Sep />
      <LinkButton editor={editor} active={s.link} />
      <ImageButton editor={editor} />
    </div>
  );
}

"use client";

import * as React from "react";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListChecks, ListOrdered, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TiptapDoc } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Zengin metin not editörü. İçerik JSON olarak saklanır; yazmayı bırakınca kaydedilir. */
export function NoteEditor({ content, onChange, autoFocus }: { content: TiptapDoc; onChange: (doc: TiptapDoc) => void; autoFocus?: boolean }) {
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Yazmaya başla… Liste için “- ”, yapılacaklar için “[] ” yaz." }),
    ],
    content: content as JSONContent,
    editorProps: { attributes: { class: "tiptap-content", "aria-label": "Not içeriği" } },
    onUpdate: ({ editor: e }) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(e.getJSON() as TiptapDoc), 400);
    },
  });

  React.useEffect(() => () => {
    clearTimeout(timer.current);
    if (editor && !editor.isDestroyed) onChange(editor.getJSON() as TiptapDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div className="flex flex-col gap-2">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="min-h-64" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      task: e.isActive("taskList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });
  const chain = () => editor.chain().focus();
  const items = [
    { label: "Başlık", icon: Heading2, active: s.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "Alt başlık", icon: Heading3, active: s.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "Kalın", icon: Bold, active: s.bold, run: () => chain().toggleBold().run() },
    { label: "İtalik", icon: Italic, active: s.italic, run: () => chain().toggleItalic().run() },
    { label: "Madde listesi", icon: List, active: s.bullet, run: () => chain().toggleBulletList().run() },
    { label: "Numaralı liste", icon: ListOrdered, active: s.ordered, run: () => chain().toggleOrderedList().run() },
    { label: "Yapılacaklar", icon: ListChecks, active: s.task, run: () => chain().toggleTaskList().run() },
    { label: "Alıntı", icon: Quote, active: s.quote, run: () => chain().toggleBlockquote().run() },
  ];
  return (
    <div role="toolbar" aria-label="Biçimlendirme" className="sticky top-0 z-10 -mx-1 flex flex-wrap gap-0.5 rounded-lg bg-surface/95 px-1 py-1 backdrop-blur">
      {items.map(({ label, icon: Icon, active, run }) => (
        <button
          key={label}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={run}
          aria-label={label}
          aria-pressed={active}
          title={label}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-accent-soft text-accent-text",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
      <LinkButton editor={editor} active={s.link} />
    </div>
  );
}

function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const href = url.trim() && (/^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setOpen(false);
    setUrl("");
  };
  if (active) {
    return (
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} aria-label="Bağlantıyı kaldır" aria-pressed title="Bağlantıyı kaldır"
        className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-accent-soft text-accent-text">
        <Link2 className="size-4" />
      </button>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" onMouseDown={(e) => e.preventDefault()} aria-label="Bağlantı ekle" title="Bağlantı ekle"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover hover:text-foreground">
          <Link2 className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <form onSubmit={apply} className="flex gap-2">
          <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ornek.com/makale" aria-label="Bağlantı adresi" className="h-9" />
          <Button type="submit" size="sm" className="h-9">Ekle</Button>
        </form>
        <p className="mt-2 text-xs text-ink-muted">Önce bağlantı vermek istediğin metni seç.</p>
      </PopoverContent>
    </Popover>
  );
}

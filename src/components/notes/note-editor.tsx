"use client";

import * as React from "react";
import Highlight from "@tiptap/extension-highlight";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { TiptapDoc } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { EditorBubble } from "./editor-bubble";
import { EditorToolbar } from "./editor-toolbar";

export type EditorStats = { words: number; characters: number; saving: boolean };

/**
 * Not editörü (Tiptap). İçerik JSON olarak saklanır; yazmayı bırakınca 400 ms sonra kaydedilir.
 * Markdown kısayolları çalışır: "# " başlık, "- " liste, "[] " yapılacak, "> " alıntı, "```" kod.
 */
export function NoteEditor({
  content,
  onChange,
  autoFocus,
  onStats,
  toolbarClassName,
  contentClassName,
}: {
  content: TiptapDoc;
  onChange: (doc: TiptapDoc) => void;
  autoFocus?: boolean;
  onStats?: (s: EditorStats) => void;
  toolbarClassName?: string;
  contentClassName?: string;
}) {
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const statsRef = React.useRef(onStats);
  React.useEffect(() => {
    statsRef.current = onStats;
  });

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "heading" ? "Başlık" : "Yazmaya başla… “# ” başlık, “- ” liste, “[] ” yapılacak"),
      }),
    ],
    content: content as JSONContent,
    editorProps: { attributes: { class: cn("tiptap-content", contentClassName), "aria-label": "Not içeriği" } },
    onCreate: ({ editor: e }) => statsRef.current?.({ words: e.storage.characterCount.words(), characters: e.storage.characterCount.characters(), saving: false }),
    onUpdate: ({ editor: e }) => {
      const words = e.storage.characterCount.words();
      const characters = e.storage.characterCount.characters();
      statsRef.current?.({ words, characters, saving: true });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onChange(e.getJSON() as TiptapDoc);
        statsRef.current?.({ words, characters, saving: false });
      }, 400);
    },
  });

  // Kapanırken bekleyen değişikliği kaydet
  React.useEffect(() => () => {
    if (timer.current && editor && !editor.isDestroyed) {
      clearTimeout(timer.current);
      onChange(editor.getJSON() as TiptapDoc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <div className="flex flex-col">
      {editor && (
        <>
          <div className={cn("sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur", toolbarClassName)}>
            <EditorToolbar editor={editor} />
          </div>
          <EditorBubble editor={editor} />
        </>
      )}
      <EditorContent editor={editor} className="min-h-72" />
    </div>
  );
}

"use client";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { TiptapDoc } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Yazının okunur hâli (düzenlenemez); not editörüyle aynı biçimler */
export function RichView({ content, className }: { content: TiptapDoc; className?: string }) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: false,
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: true, autolink: true } }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight,
        Image,
      ],
      content: content as JSONContent,
      editorProps: { attributes: { class: cn("tiptap-content tiptap-read", className) } },
    },
    [content],
  );
  return <EditorContent editor={editor} />;
}

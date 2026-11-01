"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState } from "@tiptap/react";
import { Bold, Heading2, Highlighter, Italic, Strikethrough, Underline } from "lucide-react";

import { ToolButton } from "./editor-toolbar";

/** Metin seçilince beliren küçük biçimlendirme menüsü */
export function EditorBubble({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"),
      strike: e.isActive("strike"), highlight: e.isActive("highlight"), h2: e.isActive("heading", { level: 2 }),
    }),
  });
  const c = () => editor.chain().focus();
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, state }) => !state.selection.empty && !e.isActive("codeBlock") && e.isEditable}
      className="flex items-center gap-0.5 rounded-lg border border-line bg-popover p-1 shadow-lift"
    >
      <ToolButton label="Kalın" icon={Bold} active={s.bold} run={() => c().toggleBold().run()} />
      <ToolButton label="İtalik" icon={Italic} active={s.italic} run={() => c().toggleItalic().run()} />
      <ToolButton label="Altı çizili" icon={Underline} active={s.underline} run={() => c().toggleUnderline().run()} />
      <ToolButton label="Üstü çizili" icon={Strikethrough} active={s.strike} run={() => c().toggleStrike().run()} />
      <ToolButton label="Vurgula" icon={Highlighter} active={s.highlight} run={() => c().toggleHighlight().run()} />
      <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
      <ToolButton label="Başlık" icon={Heading2} active={s.h2} run={() => c().toggleHeading({ level: 2 }).run()} />
    </BubbleMenu>
  );
}

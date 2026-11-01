"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { uploadNoteImage } from "@/lib/notes/upload-image";
import { ToolButton } from "./editor-toolbar";

/** Görseli yükleyip imlecin olduğu yere (ya da verilen konuma) ekler. */
export async function insertImages(editor: Editor, files: File[], pos?: number) {
  const images = files.filter((f) => f.type.startsWith("image/"));
  if (!images.length) return false;
  const id = toast.loading(images.length > 1 ? `${images.length} görsel yükleniyor…` : "Görsel yükleniyor…");
  try {
    for (const file of images) {
      const src = await uploadNoteImage(file);
      const node = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } };
      if (pos != null) editor.chain().focus().insertContentAt(pos, node).run();
      else editor.chain().focus().insertContent(node).run();
    }
    toast.success(images.length > 1 ? "Görseller eklendi" : "Görsel eklendi", { id });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Görsel eklenemedi", { id });
  }
  return true;
}

export function ImageButton({ editor }: { editor: Editor }) {
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <ToolButton label="Görsel ekle" icon={ImagePlus} run={() => input.current?.click()} shortcut="ya da yapıştır / sürükle" />
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          void insertImages(editor, files);
        }}
      />
    </>
  );
}

"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { Check, Pencil, Trash2 } from "lucide-react";

import { NoteEditor } from "@/components/notes/note-editor";
import { Button } from "@/components/ui/button";
import { data } from "@/lib/data/store";
import { removeWithUndo } from "@/lib/data/undo";
import type { ForumPost } from "@/lib/data/types";
import { fmt } from "@/lib/time";
import { RichView } from "./rich-view";

/** Başlıktaki tek yazı: sıra numarası, tarih, içerik; yerinde düzenlenir */
export function PostCard({ post, n }: { post: ForumPost; n: number }) {
  const [editing, setEditing] = React.useState(false);
  const edited = new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 60_000;

  return (
    <article id={`yazi-${n}`} className="group overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex items-center gap-2 border-b border-line bg-sunken/40 px-4 py-2">
        <span className="tabular text-xs font-semibold text-course-fg">#{n}</span>
        <span className="text-xs text-ink-muted first-letter:uppercase">{fmt(parseISO(post.created_at), "d MMMM yyyy, EEEE · HH:mm")}</span>
        {edited && <span className="text-xs text-ink-subtle">· düzenlendi</span>}
        <div className="ml-auto flex items-center gap-0.5">
          {editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><Check /> Bitti</Button>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" aria-label={`#${n} yazısını düzenle`} onClick={() => setEditing(true)} className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100"><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" aria-label={`#${n} yazısını sil`} onClick={() => removeWithUndo("forum_posts", post, "Yazı silindi")} className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100 max-sm:opacity-100"><Trash2 /></Button>
            </>
          )}
        </div>
      </header>
      {editing ? (
        <NoteEditor
          content={post.content}
          autoFocus
          onChange={(doc) => data().update("forum_posts", post.id, { content: doc })}
          contentClassName="tiptap-short px-5"
        minHeightClassName="min-h-32"
        />
      ) : (
        <div className="px-5 py-4" onDoubleClick={() => setEditing(true)}>
          <RichView content={post.content} />
        </div>
      )}
    </article>
  );
}

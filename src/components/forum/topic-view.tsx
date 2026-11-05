"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { MessageSquareText, Pencil, Pin, PinOff, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/layout/empty-state";
import { NoteEditor } from "@/components/notes/note-editor";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { TiptapDoc } from "@/lib/data/types";
import { addPost, forumPath, isEmptyDoc, postsOf } from "@/lib/domain/forum";
import { AppLink, goTo } from "@/lib/nav/nav-context";
import { ForumCrumbs } from "./forum-crumbs";
import { PostCard } from "./post-card";

const EMPTY: TiptapDoc = { type: "doc", content: [] };

/** Başlık sayfası: yazılar eskiden yeniye, en altta yeni yazı kutusu */
export function TopicView({ categoryId, topicId }: { categoryId: string; topicId: string }) {
  const topic = useRow("forum_topics", topicId);
  const cat = useRow("forum_categories", categoryId);
  const posts = postsOf(topicId, useRows("forum_posts"));
  const [renaming, setRenaming] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);

  if (!topic || !cat) return <EmptyState icon={MessageSquareText} title="Başlık bulunamadı" description="Silinmiş olabilir." action={<AppLink href="/forum" className="text-sm font-medium underline">Foruma dön</AppLink>} />;

  return (
    <div data-course={cat.color} className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <ForumCrumbs items={[{ label: "Forum", href: "/forum" }, { label: cat.name, href: forumPath(cat.id) }, { label: topic.title }]} />
        <div className="flex items-start gap-3">
          {renaming ? (
            <form
              className="flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                const v = String(new FormData(e.currentTarget).get("title") ?? "").trim();
                if (v.length >= 2) data().update("forum_topics", topic.id, { title: v });
                setRenaming(false);
              }}
            >
              <input name="title" autoFocus defaultValue={topic.title} aria-label="Başlık" onBlur={(e) => e.currentTarget.form?.requestSubmit()} onKeyDown={(e) => e.key === "Escape" && setRenaming(false)} className="w-full rounded-md border border-input bg-surface px-2 py-1 text-2xl font-semibold tracking-[-0.015em] outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </form>
          ) : (
            <h1 className="min-w-0 flex-1 text-2xl leading-8 font-semibold tracking-[-0.015em]">
              {topic.is_pinned && <Pin className="mr-1.5 inline size-5 -translate-y-0.5 fill-current text-course-fg" aria-label="Sabitlendi" />}
              {topic.title}
            </h1>
          )}
          <div className="flex shrink-0 gap-0.5">
            <Button variant="ghost" size="icon" aria-label="Başlığı yeniden adlandır" onClick={() => setRenaming(true)}><Pencil /></Button>
            <Button variant="ghost" size="icon" aria-label={topic.is_pinned ? "Sabitlemeyi kaldır" : "Üste sabitle"} title={topic.is_pinned ? "Sabitlemeyi kaldır" : "Kategoride en üste sabitle"} onClick={() => data().update("forum_topics", topic.id, { is_pinned: !topic.is_pinned })}>
              {topic.is_pinned ? <PinOff /> : <Pin />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Başlığı sil" className="hover:text-destructive" onClick={() => setConfirm(true)}><Trash2 /></Button>
          </div>
        </div>
        <p className="text-13 text-ink-muted">{posts.length ? `${posts.length} yazı` : "Henüz yazı yok"}</p>
      </div>

      {posts.map((p, i) => <PostCard key={p.id} post={p} n={i + 1} />)}

      <Composer topicId={topic.id} first={posts.length === 0} />

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`“${topic.title}” silinsin mi?`}
        description={posts.length ? `İçindeki ${posts.length} yazı da silinir.` : "Başlık boş; başka bir şey silinmez."}
        confirmLabel="Sil"
        onConfirm={() => {
          data().remove("forum_topics", topic.id);
          toast("Başlık silindi");
          goTo(forumPath(cat.id));
        }}
      />
    </div>
  );
}

/** Yeni yazı kutusu: zengin metin; Ctrl/Cmd + Enter ile de eklenir */
function Composer({ topicId, first }: { topicId: string; first: boolean }) {
  const editor = React.useRef<Editor | null>(null);
  const [round, setRound] = React.useState(0);

  const submit = () => {
    const doc = editor.current?.getJSON() as TiptapDoc | undefined;
    if (!doc || isEmptyDoc(doc)) return toast("Önce bir şeyler yaz.");
    addPost(topicId, doc);
    setRound((r) => r + 1);
  };

  return (
    <section
      aria-label="Yeni yazı"
      className="overflow-hidden rounded-xl border border-line-strong bg-surface focus-within:border-ring"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          submit();
        }
      }}
    >
      <NoteEditor
        key={round}
        content={EMPTY}
        onChange={() => {}}
        onReady={(e) => (editor.current = e)}
        placeholder={first ? "İlk yazını yaz…" : "Bu başlığa yeni bir yazı ekle…"}
        contentClassName="tiptap-short px-5"
        minHeightClassName="min-h-32"
      />
      <footer className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <span className="text-xs text-ink-subtle">Ctrl / ⌘ + Enter ile ekle</span>
        <Button size="sm" onClick={submit}><Send /> Yazıyı ekle</Button>
      </footer>
    </section>
  );
}

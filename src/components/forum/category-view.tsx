"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { MessageSquareText, Pencil, Pin, Plus, Search } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { searchKey } from "@/lib/catalog";
import { useRow, useRows } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import { byActivity, forumPath, postsOf } from "@/lib/domain/forum";
import { AppLink } from "@/lib/nav/nav-context";
import { fmt, timeAgo } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { ForumCrumbs } from "./forum-crumbs";

/** Kategori sayfası: başlık listesi (sabitlenenler üstte, sonra en son yazılan) */
export function CategoryView({ categoryId }: { categoryId: string }) {
  const cat = useRow("forum_categories", categoryId);
  const area = useRow("courses", cat?.course_id ?? undefined);
  const posts = useRows("forum_posts");
  const all = useRows("forum_topics").filter((t) => t.category_id === categoryId).sort(byActivity);
  const [query, setQuery] = React.useState("");
  const q = searchKey(query);

  if (!cat) return <EmptyState icon={MessageSquareText} title="Kategori bulunamadı" description="Silinmiş olabilir." action={<AppLink href="/forum" className="text-sm font-medium underline">Foruma dön</AppLink>} />;

  const rows = all
    .map((t) => {
      const list = postsOf(t.id, posts);
      return { t, count: list.length, first: list[0], text: list.map((p) => docToText(p.content, 4000)).join(" ") };
    })
    .filter((r) => !q || searchKey(`${r.t.title} ${r.text}`).includes(q));
  const newTopic = <Button onClick={() => ui().open({ type: "forum-topic", categoryId })}><Plus /> Yeni başlık</Button>;

  return (
    <div data-course={cat.color} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ForumCrumbs items={[{ label: "Forum", href: "/forum" }, { label: cat.name }]} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-course text-course-fg" aria-hidden><MessageSquareText className="size-5" strokeWidth={1.8} /></span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-[-0.015em]">{cat.name}</h1>
              <p className="text-13 text-ink-muted">
                {[cat.description, `${all.length} başlık`, area ? `Alan: ${area.name}` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label="Kategoriyi düzenle" onClick={() => ui().open({ type: "forum-category", categoryId })}><Pencil /></Button>
            {newTopic}
          </div>
        </div>
      </div>

      {all.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="Bu kategoride henüz başlık yok" description="Bir konu aç: “Üst vücut programım”, “Diz sakatlığı notları”, “Haftalık menü”… İçine istediğin kadar yazı eklersin." action={newTopic} />
      ) : (
        <>
          <label className="flex h-9 max-w-sm items-center gap-2 rounded-md border border-input bg-surface px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Başlıklarda ve yazılarda ara" aria-label="Başlıklarda ve yazılarda ara" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-subtle" />
          </label>
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="hidden grid-cols-[minmax(0,1fr)_5rem_9rem] gap-4 border-b border-line bg-sunken/50 px-4 py-2 text-xs font-medium text-ink-muted md:grid">
              <span>Başlık</span><span className="text-right">Yazı</span><span className="text-right">Son yazı</span>
            </div>
            {rows.length === 0 ? (
              <p className="px-4 py-6 text-13 text-ink-muted">Aramana uyan başlık yok.</p>
            ) : (
              <ul>
                {rows.map(({ t, count, first }) => (
                  <li key={t.id} className="border-b border-line last:border-b-0">
                    <AppLink href={forumPath(categoryId, t.id)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3 transition-colors outline-none hover:bg-hover/50 focus-visible:bg-hover md:grid-cols-[minmax(0,1fr)_5rem_9rem]">
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          {t.is_pinned && <Pin className="size-3.5 shrink-0 fill-current text-course-fg" aria-label="Sabitlendi" />}
                          <span className="truncate text-sm font-semibold">{t.title}</span>
                        </span>
                        <span className="block truncate text-13 text-ink-muted">
                          {first ? docToText(first.content, 140) || "Görsel" : "Henüz yazı yok"}
                        </span>
                        <span className="block text-xs text-ink-subtle">Açıldı {fmt(parseISO(t.created_at), "d MMM yyyy")}</span>
                      </span>
                      <span className="tabular text-right text-sm">{count}<span className="text-xs text-ink-muted md:hidden"> yazı</span></span>
                      <span className="tabular hidden text-right text-13 text-ink-muted md:block">{timeAgo(t.last_post_at)}</span>
                    </AppLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

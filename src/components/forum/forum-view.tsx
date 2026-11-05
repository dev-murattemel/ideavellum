"use client";

import { MessagesSquare, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { byCategoryOrder, categoryStats, forumPath } from "@/lib/domain/forum";
import { AppLink, goTo } from "@/lib/nav/nav-context";
import { timeAgo } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/** Forum ana sayfası: kategoriler (eski forum siteleri gibi) ve son hareketler */
export function ForumView() {
  const categories = useRows("forum_categories").sort(byCategoryOrder);
  const topics = useRows("forum_topics");
  const posts = useRows("forum_posts");
  const areas = useActiveCourses().filter((a) => !categories.some((c) => c.course_id === a.id || c.name === a.name));
  const recent = [...topics].sort((a, b) => b.last_post_at.localeCompare(a.last_post_at)).slice(0, 6);
  const catOf = (id: string) => categories.find((c) => c.id === id);

  const addCategory = <Button onClick={() => ui().open({ type: "forum-category" })}><Plus /> Kategori aç</Button>;
  const fromArea = (a: (typeof areas)[number]) => {
    const c = data().insert("forum_categories", { name: a.name, description: null, color: a.color, course_id: a.id, position: null });
    goTo(forumPath(c.id));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Forum"
        description="Kategori aç, içinde başlıklar aç, her başlığa istediğin kadar yaz."
        actions={categories.length > 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => ui().open({ type: "forum-topic" })}><Plus /> Yeni başlık</Button>
            {addCategory}
          </div>
        )}
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Henüz kategori yok"
          description="Spor, Mutfak, Okuma gibi bir kategori aç; içinde “Üst vücut programım”, “Protein tarifleri” gibi başlıklar açıp yazmaya başla."
          action={addCategory}
        />
      ) : (
        <section className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_minmax(0,16rem)] gap-4 border-b border-line bg-sunken/50 px-4 py-2 text-xs font-medium text-ink-muted md:grid">
            <span>Kategori</span><span className="text-right">Başlık</span><span className="text-right">Yazı</span><span>Son yazı</span>
          </div>
          <ul>
            {categories.map((c) => {
              const s = categoryStats(c.id, topics, posts);
              return (
                <li key={c.id} data-course={c.color} className="border-b border-line last:border-b-0">
                  <AppLink href={forumPath(c.id)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors outline-none hover:bg-hover/50 focus-visible:bg-hover md:grid-cols-[minmax(0,1fr)_7rem_7rem_minmax(0,16rem)]">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-course text-course-fg" aria-hidden>
                        <MessagesSquare className="size-5" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{c.name}</span>
                        {c.description && <span className="block truncate text-13 text-ink-muted">{c.description}</span>}
                      </span>
                    </span>
                    <span className="tabular text-right text-sm md:block"><span className="md:hidden text-xs text-ink-muted">{s.topics} başlık · {s.posts} yazı</span><span className="hidden md:inline">{s.topics}</span></span>
                    <span className="tabular hidden text-right text-sm md:block">{s.posts}</span>
                    <span className="col-span-2 min-w-0 text-13 md:col-span-1">
                      {s.latest ? (
                        <>
                          <span className="block truncate font-medium">{s.latest.title}</span>
                          <span className="block text-xs text-ink-muted">{timeAgo(s.latest.last_post_at)}</span>
                        </>
                      ) : <span className="text-ink-subtle">Henüz başlık yok</span>}
                    </span>
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {areas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-13 text-ink-muted">Alanlarından kategori aç:</span>
          {areas.slice(0, 8).map((a) => (
            <button key={a.id} type="button" data-course={a.color} onClick={() => fromArea(a)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-13 transition-colors hover:border-line-strong">
              <span className="size-2 rounded-full bg-course-solid" aria-hidden /> {a.name}
            </button>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Son hareketler</h2>
          <ul className="overflow-hidden rounded-xl border border-line bg-surface">
            {recent.map((t) => {
              const c = catOf(t.category_id);
              return (
                <li key={t.id} className="border-b border-line last:border-b-0">
                  <AppLink href={forumPath(t.category_id, t.id)} className="flex items-center gap-3 px-4 py-2.5 transition-colors outline-none hover:bg-hover/50 focus-visible:bg-hover">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.title}</span>
                    {c && <span data-course={c.color} className="flex shrink-0 items-center gap-1.5 text-xs text-ink-muted"><span className="size-1.5 rounded-full bg-course-solid" aria-hidden />{c.name}</span>}
                    <span className="tabular w-20 shrink-0 text-right text-xs text-ink-muted">{timeAgo(t.last_post_at)}</span>
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

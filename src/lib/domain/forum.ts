import { data } from "@/lib/data/store";
import type { ForumCategory, ForumPost, ForumTopic, TiptapDoc } from "@/lib/data/types";

/** Yazının içi boş mu (yalnızca boş paragraflar) */
export function isEmptyDoc(d: TiptapDoc | null | undefined): boolean {
  const walk = (n: unknown): boolean => {
    if (!n || typeof n !== "object") return true;
    const node = n as { type?: string; text?: string; content?: unknown[] };
    if (node.type === "image" || node.type === "horizontalRule") return false;
    if (node.text?.trim()) return false;
    return (node.content ?? []).every(walk);
  };
  return walk(d);
}

const touch = (topicId: string) => data().update("forum_topics", topicId, { last_post_at: new Date().toISOString() });

/** Yeni başlık + ilk yazısı */
export function createTopic(categoryId: string, title: string, content: TiptapDoc | null) {
  const topic = data().insert("forum_topics", {
    category_id: categoryId, title: title.trim(), is_pinned: false, tags: [], last_post_at: new Date().toISOString(),
  });
  if (content && !isEmptyDoc(content)) data().insert("forum_posts", { topic_id: topic.id, content });
  return topic;
}

/** Başlığa yazı ekler, başlığın "son yazı" zamanını günceller */
export function addPost(topicId: string, content: TiptapDoc) {
  const post = data().insert("forum_posts", { topic_id: topicId, content });
  touch(topicId);
  return post;
}

/** Kategori başına: başlık sayısı, yazı sayısı, en son hareket eden başlık */
export function categoryStats(categoryId: string, topics: ForumTopic[], posts: ForumPost[]) {
  const own = topics.filter((t) => t.category_id === categoryId);
  const ids = new Set(own.map((t) => t.id));
  const postCount = posts.filter((p) => ids.has(p.topic_id)).length;
  const latest = [...own].sort((a, b) => b.last_post_at.localeCompare(a.last_post_at))[0];
  return { topics: own.length, posts: postCount, latest };
}

/** Başlığın yazıları, eskiden yeniye */
export const postsOf = (topicId: string, posts: ForumPost[]) =>
  posts.filter((p) => p.topic_id === topicId).sort((a, b) => a.created_at.localeCompare(b.created_at));

/** Sabitlenenler üstte, sonra en son yazılan */
export const byActivity = (a: ForumTopic, b: ForumTopic) =>
  Number(b.is_pinned) - Number(a.is_pinned) || b.last_post_at.localeCompare(a.last_post_at);

export const byCategoryOrder = (a: ForumCategory, b: ForumCategory) =>
  a.position && b.position ? (a.position < b.position ? -1 : 1) : a.created_at.localeCompare(b.created_at);

export const forumPath = (categoryId?: string, topicId?: string) =>
  topicId ? `/forum/${categoryId}/${topicId}` : categoryId ? `/forum/${categoryId}` : "/forum";

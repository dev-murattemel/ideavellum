import { data } from "@/lib/data/store";
import type { Note } from "@/lib/data/types";

export const isEmptyNote = (n: Pick<Note, "title" | "content" | "tags">) =>
  !n.title.trim() && !(n.content.content?.length) && !(n.tags?.length);

/** Hiç yazılmadan bırakılan notu sessizce siler (listede "Başlıksız not" birikmesin). */
export function discardIfEmpty(id: string | null | undefined) {
  if (!id) return;
  const n = data().notes[id];
  if (n && isEmptyNote(n)) data().remove("notes", id);
}

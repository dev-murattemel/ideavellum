import { data } from "@/lib/data/store";
import { ui } from "@/lib/ui-store";

/** Boş bir not açar ve düzenleyiciyi gösterir. */
export function createNote(courseId?: string | null, topicId?: string | null) {
  const note = data().insert("notes", {
    course_id: courseId ?? null,
    topic_id: topicId ?? null,
    title: "",
    content: { type: "doc", content: [] },
    is_pinned: false,
  });
  ui().openNote(note.id);
  return note;
}

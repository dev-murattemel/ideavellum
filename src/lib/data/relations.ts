import type { TableName } from "./types";

/** Bir kayıt silinince bağlı kayıtlara ne olacağı (veritabanındaki foreign key kurallarıyla aynı). */
export const CASCADE: Partial<Record<TableName, { table: TableName; fk: string }[]>> = {
  terms: [],
  courses: [
    { table: "topics", fk: "course_id" },
    { table: "class_sessions", fk: "course_id" },
    { table: "tasks", fk: "course_id" },
    { table: "notes", fk: "course_id" },
    { table: "resources", fk: "course_id" },
    { table: "study_logs", fk: "course_id" },
  ],
  class_sessions: [
    { table: "attendance", fk: "class_session_id" },
    { table: "session_entries", fk: "class_session_id" },
  ],
  tasks: [{ table: "task_checklist_items", fk: "task_id" }],
  habits: [{ table: "habit_checks", fk: "habit_id" }],
  resources: [{ table: "highlights", fk: "resource_id" }],
  forum_categories: [{ table: "forum_topics", fk: "category_id" }],
  forum_topics: [{ table: "forum_posts", fk: "topic_id" }],
};

export const SET_NULL: Partial<Record<TableName, { table: TableName; fk: string }[]>> = {
  notes: [
    { table: "session_entries", fk: "note_id" },
    { table: "sticky_notes", fk: "note_id" },
  ],
  tasks: [{ table: "sticky_notes", fk: "task_id" }],
  resources: [{ table: "habits", fk: "resource_id" }],
  courses: [{ table: "forum_categories", fk: "course_id" }],
  terms: [{ table: "courses", fk: "term_id" }],
  topics: [
    { table: "tasks", fk: "topic_id" },
    { table: "notes", fk: "topic_id" },
    { table: "resources", fk: "topic_id" },
    { table: "study_logs", fk: "topic_id" },
  ],
};

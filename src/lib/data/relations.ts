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
  class_sessions: [{ table: "attendance", fk: "class_session_id" }],
  tasks: [{ table: "task_checklist_items", fk: "task_id" }],
};

export const SET_NULL: Partial<Record<TableName, { table: TableName; fk: string }[]>> = {
  terms: [{ table: "courses", fk: "term_id" }],
  topics: [
    { table: "tasks", fk: "topic_id" },
    { table: "notes", fk: "topic_id" },
    { table: "resources", fk: "topic_id" },
    { table: "study_logs", fk: "topic_id" },
  ],
};

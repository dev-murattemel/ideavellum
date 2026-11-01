import type { CourseColor } from "@/lib/course-colors";

/** Alan adları veritabanı sütunlarıyla birebir aynı (snake_case). */
type Base = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Term = Base & {
  name: string;
  start_date: string; // yyyy-MM-dd
  end_date: string;
  is_active: boolean;
};

export type CourseStatus = "active" | "paused" | "completed" | "dropped";

export type AreaKind = "course" | "fitness" | "cooking" | "watching" | "reading" | "spiritual" | "hobby" | "project" | "other";

/** Alan (eski adıyla ders): ders, spor, mutfak, izleme, okuma… her tür düzenli uğraş */
export type Course = Base & {
  kind: AreaKind;
  term_id: string | null;
  name: string;
  code: string | null;
  color: CourseColor;
  description: string | null;
  goal: string | null;
  status: CourseStatus;
  target_weekly_minutes: number | null;
  start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  final_reflection: string | null;
  final_note: string | null;
  final_rating: number | null;
};

export type TopicStatus = "not_started" | "in_progress" | "done";

export type Topic = Base & {
  course_id: string;
  title: string;
  position: string;
  status: TopicStatus;
  done_at: string | null;
};

export type BellOverrides = {
  before_minutes?: number | null;
  start_bell?: boolean;
  end_bell?: boolean;
};

export type SessionRepeat = "weekly" | "biweekly" | "monthly" | "once";

export type ClassSession = Base & {
  course_id: string;
  weekday: number; // 1 = Pazartesi … 7 = Pazar
  repeat: SessionRepeat;
  /** 2 haftada bir / aylık / tek seferlik için başlangıç günü (yyyy-MM-dd) */
  anchor_date: string | null;
  start_time: string; // "HH:mm"
  end_time: string;
  location: string | null;
  valid_from: string | null;
  valid_until: string | null;
  bell_overrides: BellOverrides;
};

export type AttendanceStatus = "attended" | "missed" | "postponed";

export type Attendance = Base & {
  class_session_id: string;
  date: string; // yyyy-MM-dd
  status: AttendanceStatus;
  note: string | null;
};

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = Base & {
  course_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null; // ISO (UTC)
  position: string;
  completed_at: string | null;
};

export type ChecklistItem = Base & {
  task_id: string;
  label: string;
  is_done: boolean;
  position: string;
};

export type TiptapDoc = { type: "doc"; content?: unknown[] };

export type Note = Base & {
  course_id: string | null;
  topic_id: string | null;
  title: string;
  content: TiptapDoc;
  is_pinned: boolean;
  tags: string[];
};

export type JournalEntry = Base & {
  date: string; // yyyy-MM-dd, günde bir sayfa
  content: TiptapDoc;
  mood: number | null; // 1–5
  tags: string[];
};

export type Quote = Base & {
  text: string;
  author: string | null;
  source: string | null;
  tags: string[];
  is_favorite: boolean;
};

export type ResourceType = "video" | "book" | "article" | "podcast" | "course" | "other";
export type ResourceStatus = "queued" | "in_progress" | "done";
export type ResourceUnit = "page" | "minute" | "chapter";

export type Resource = Base & {
  course_id: string | null;
  topic_id: string | null;
  type: ResourceType;
  title: string;
  url: string | null;
  author: string | null;
  status: ResourceStatus;
  progress_current: number | null;
  progress_total: number | null;
  unit: ResourceUnit | null;
  rating: number | null;
  summary: string | null;
};

export type StudySource = "timer" | "manual" | "session";

export type StudyLog = Base & {
  course_id: string | null;
  topic_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  source: StudySource;
};

export type BellSound = "bell-soft" | "bell-classic" | "chime";

export type BellSettings = {
  before_minutes: number;
  start_bell: boolean;
  end_bell: boolean;
  sound: BellSound;
  volume: number; // 0–1
  quiet_hours: { enabled: boolean; from: string; to: string };
};

export type NotificationEvent = "bell" | "task_due" | "daily_digest" | "weekly_report" | "overdue";
export type NotificationChannel = "in_app" | "push" | "email";

export type NotificationPrefs = {
  channels: Record<NotificationEvent, Record<NotificationChannel, boolean>>;
  daily_digest_time: string;
  weekly_report: { weekday: number; time: string };
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  timezone: string;
  locale: string;
  bell_settings: BellSettings;
  notification_prefs: NotificationPrefs;
  ai_enabled: boolean;
};

export type Tables = {
  terms: Term;
  courses: Course;
  topics: Topic;
  class_sessions: ClassSession;
  attendance: Attendance;
  tasks: Task;
  task_checklist_items: ChecklistItem;
  notes: Note;
  resources: Resource;
  study_logs: StudyLog;
  journal_entries: JournalEntry;
  quotes: Quote;
};

export type TableName = keyof Tables;

export const TABLE_NAMES: TableName[] = [
  "terms",
  "courses",
  "topics",
  "class_sessions",
  "attendance",
  "tasks",
  "task_checklist_items",
  "notes",
  "resources",
  "study_logs",
  "journal_entries",
  "quotes",
];

/** Yeni kayıt: id, user_id ve zaman damgaları depo tarafından doldurulur. */
export type NewRow<K extends TableName> = Omit<Tables[K], keyof Base> & Partial<Pick<Base, "id">>;

export type DataSnapshot = { [K in TableName]: Record<string, Tables[K]> };

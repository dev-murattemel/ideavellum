import type { CourseColor } from "@/lib/course-colors";

/** Ders adları veritabanı sütunlarıyla birebir aynı (snake_case). */
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

/** Ders (eski adıyla ders): ders, spor, mutfak, izleme, okuma… her tür düzenli uğraş */
export type Course = Base & {
  kind: AreaKind;
  /** Sürükle-bırak sırası (fractional index); boşsa oluşturulma sırası */
  position: string | null;
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
  /** Bağlı alan; boşsa serbest etkinlik (kendi başlığı ve rengiyle) */
  course_id: string | null;
  /** Serbest etkinliğin adı ya da alan saatine özel başlık ("Bacak günü") */
  title?: string | null;
  color?: CourseColor | null;
  /** Alt başlık / açıklama ("Sabah rutini: cilt bakımı ve yürüyüş") */
  notes?: string | null;
  /** Her seferki kontrol listesi şablonu; her gün işaretsiz olarak kopyalanır */
  checklist?: EntryCheck[];
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

/** Takvimdeki tek bir günün kontrol maddesi (hareket, malzeme, bölüm…) */
export type EntryCheck = {
  id: string;
  label: string;
  done: boolean;
  /** Nasıl ölçüldüğü; yoksa sadece metin */
  metric?: "strength" | "cardio" | "amount" | "plain";
  sets?: number | null;
  reps?: number | null;
  weight?: number | null; // kg
  minutes?: number | null;
  km?: number | null;
  amount?: number | null;
  unit?: string | null;
};

/** Bir ders saatinin belirli bir güne ait ayrıntısı: "Spor · 2 Kasım" → "Üst göğüs", setler, notlar */
export type SessionEntry = Base & {
  class_session_id: string;
  date: string; // yyyy-MM-dd
  title: string | null;
  details: string | null;
  checklist: EntryCheck[];
  /** "Notlara kaydet" ile oluşturulan not */
  note_id: string | null;
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

export type Habit = Base & {
  name: string;
  color: CourseColor;
  target_per_week: number; // 1–7
  position: string | null;
  archived: boolean;
  /** Günlük miktar hedefi (2 litre, 20 sayfa); boşsa tek dokunuşla işaretlenir */
  target_amount?: number | null;
  unit?: string | null;
  /** Bağlı kaynak (ör. okunan kitap): sayfa girince kitabın ilerlemesi de artar */
  resource_id?: string | null;
};

export type HabitCheck = Base & {
  habit_id: string;
  date: string; // yyyy-MM-dd
  /** O gün yapılan miktar (1,5 litre, 15 sayfa); boşsa tam yapıldı sayılır */
  amount?: number | null;
  note?: string | null;
};

/** Forum kategorisi (Spor, Mutfak…): içinde başlıklar açılır */
export type ForumCategory = Base & {
  name: string;
  description: string | null;
  color: CourseColor;
  /** İsteğe bağlı: bağlı alan */
  course_id: string | null;
  position: string | null;
};

/** Forum başlığı: bir konu, içinde tarih sırasıyla yazılar */
export type ForumTopic = Base & {
  category_id: string;
  title: string;
  is_pinned: boolean;
  tags: string[];
  last_post_at: string;
};

/** Başlığın içindeki tek yazı (zengin metin) */
export type ForumPost = Base & {
  topic_id: string;
  content: TiptapDoc;
};

/** Kitap defteri: bir kaynaktan alıntı / vurgu ve kişisel not */
export type Highlight = Base & {
  resource_id: string;
  text: string;
  note: string | null;
  page: number | null;
  color: CourseColor;
  tags: string[];
};

/** Mantar panodaki yapışkan not: hızla yazılır, sonra toparlanır */
export type StickyNote = Base & {
  text: string;
  color: CourseColor;
  tags: string[];
  /** Panodaki konum (px) ve üst üste binme sırası */
  x: number;
  y: number;
  z: number;
  /** Arşivlendiyse zamanı (yalnızca kullanıcı isteyince) */
  archived_at: string | null;
  /** Eski sürümden kalan alan; artık bağlantılar aşağıda */
  converted_to: "task" | "note" | null;
  /** Aktarıldığı yerler: not panoda kalır, buralara bağlanır */
  task_id: string | null;
  note_id: string | null;
  journal_date: string | null;
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
  session_entries: SessionEntry;
  tasks: Task;
  task_checklist_items: ChecklistItem;
  notes: Note;
  resources: Resource;
  study_logs: StudyLog;
  journal_entries: JournalEntry;
  quotes: Quote;
  habits: Habit;
  habit_checks: HabitCheck;
  sticky_notes: StickyNote;
  highlights: Highlight;
  forum_categories: ForumCategory;
  forum_topics: ForumTopic;
  forum_posts: ForumPost;
};

export type TableName = keyof Tables;

export const TABLE_NAMES: TableName[] = [
  "terms",
  "courses",
  "topics",
  "class_sessions",
  "attendance",
  "session_entries",
  "tasks",
  "task_checklist_items",
  "notes",
  "resources",
  "study_logs",
  "journal_entries",
  "quotes",
  "habits",
  "habit_checks",
  "sticky_notes",
  "highlights",
  "forum_categories",
  "forum_topics",
  "forum_posts",
];

/** Yeni kayıt: id, user_id ve zaman damgaları depo tarafından doldurulur. */
export type NewRow<K extends TableName> = Omit<Tables[K], keyof Base> & Partial<Pick<Base, "id">>;

export type DataSnapshot = { [K in TableName]: Record<string, Tables[K]> };

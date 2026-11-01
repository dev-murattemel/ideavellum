-- Tüm uygulama tabloları. Her tabloda RLS açık ve politika: user_id = auth.uid()

alter table public.profiles add column if not exists ai_enabled boolean not null default false;

-- Tablo başına: updated_at tetikleyicisi + RLS + tek politika (seç/ekle/güncelle/sil)
create or replace function public.ivl_secure_table(t regclass)
returns void
language plpgsql
set search_path = ''
as $$
begin
  execute format('create trigger set_updated_at before update on %s for each row execute function public.set_updated_at()', t);
  execute format('alter table %s enable row level security', t);
  execute format(
    'create policy "Sahibi erişir" on %s for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
end;
$$;

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.terms');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  term_id uuid references public.terms on delete set null,
  name text not null,
  code text,
  color text not null check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate')),
  description text,
  goal text,
  status text not null default 'active' check (status in ('active','paused','completed','dropped')),
  target_weekly_minutes int check (target_weekly_minutes >= 0),
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  final_reflection text,
  final_note text,
  final_rating int check (final_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.courses');

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  position text not null,
  status text not null default 'not_started' check (status in ('not_started','in_progress','done')),
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.topics');

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  weekday int not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  location text,
  valid_from date,
  valid_until date,
  bell_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.class_sessions');

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  class_session_id uuid not null references public.class_sessions on delete cascade,
  date date not null,
  status text not null check (status in ('attended','missed','postponed')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_session_id, date)
);
select public.ivl_secure_table('public.attendance');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  topic_id uuid references public.topics on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','review','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_at timestamptz,
  position text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.tasks');

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  task_id uuid not null references public.tasks on delete cascade,
  label text not null,
  is_done boolean not null default false,
  position text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.task_checklist_items');

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  topic_id uuid references public.topics on delete set null,
  title text not null default '',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.notes');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  topic_id uuid references public.topics on delete set null,
  type text not null check (type in ('video','book','article','podcast','course','other')),
  title text not null,
  url text,
  author text,
  status text not null default 'queued' check (status in ('queued','in_progress','done')),
  progress_current int,
  progress_total int,
  unit text check (unit in ('page','minute','chapter')),
  rating int check (rating between 1 and 5),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.resources');

create table public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  topic_id uuid references public.topics on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int not null check (duration_minutes >= 0),
  source text not null check (source in ('timer','manual','session')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.study_logs');

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('bell_before','bell_start','bell_end','task_due','daily_digest','weekly_report','custom')),
  entity_type text,
  entity_id uuid,
  fire_at timestamptz not null,
  channels text[] not null default '{in_app}',
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending','sent','failed','cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.reminders');
create index reminders_due_idx on public.reminders (fire_at) where status = 'pending';

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.push_subscriptions');

create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  reminder_id uuid references public.reminders on delete set null,
  channel text not null,
  status text not null,
  error text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.ivl_secure_table('public.notification_log');

-- Sık kullanılan sorgular için dizinler
create index on public.courses (user_id, term_id);
create index on public.topics (course_id, position);
create index on public.class_sessions (user_id, weekday);
create index on public.tasks (user_id, status, position);
create index on public.study_logs (user_id, started_at);

drop function public.ivl_secure_table(regclass);

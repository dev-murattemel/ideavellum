-- Alanlar (eski adıyla dersler) artık her tür uğraşı kapsar: ders, spor, mutfak, izleme, okuma…
alter table public.courses add column if not exists kind text not null default 'course'
  check (kind in ('course', 'fitness', 'cooking', 'watching', 'reading', 'spiritual', 'hobby', 'project', 'other'));

-- Not etiketleri
alter table public.notes add column if not exists tags text[] not null default '{}';
create index if not exists notes_tags_idx on public.notes using gin (tags);

-- Program saatlerinde tekrar: her hafta, 2 haftada bir, her ay (ayın n. günü), tek seferlik
alter table public.class_sessions add column if not exists repeat text not null default 'weekly'
  check (repeat in ('weekly', 'biweekly', 'monthly', 'once'));
alter table public.class_sessions add column if not exists anchor_date date;

-- Günlük: her güne bir sayfa
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  mood int check (mood between 1 and 5),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Aforizmalar ve alıntılar
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  text text not null,
  author text,
  source text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.quotes for each row execute function public.set_updated_at();
alter table public.journal_entries enable row level security;
alter table public.quotes enable row level security;
create policy "Sahibi erişir" on public.journal_entries for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Sahibi erişir" on public.quotes for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.journal_entries (user_id, date);
create index on public.quotes (user_id, created_at);

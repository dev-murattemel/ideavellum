-- Takvimdeki tek bir günün ayrıntısı: "Spor · Pzt 2 Kasım" → başlık (Üst göğüs),
-- kontrol listesi (setler, malzemeler) ve serbest ayrıntı metni.
create table public.session_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  class_session_id uuid not null references public.class_sessions on delete cascade,
  date date not null,
  title text,
  details text,
  checklist jsonb not null default '[]'::jsonb,
  note_id uuid references public.notes on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_session_id, date)
);

create trigger set_updated_at before update on public.session_entries for each row execute function public.set_updated_at();
alter table public.session_entries enable row level security;
create policy "Sahibi erişir" on public.session_entries for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.session_entries (user_id, date);
create index on public.session_entries (note_id);

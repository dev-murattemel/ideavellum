-- Alışkanlıklar: günlük işaretlenen küçük rutinler (su iç, 10 sayfa oku, Kuran…)
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  color text not null check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate')),
  target_per_week int not null default 7 check (target_per_week between 1 and 7),
  position text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habit_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null references public.habits on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);

create trigger set_updated_at before update on public.habits for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.habit_checks for each row execute function public.set_updated_at();
alter table public.habits enable row level security;
alter table public.habit_checks enable row level security;
create policy "Sahibi erişir" on public.habits for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Sahibi erişir" on public.habit_checks for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.habit_checks (user_id, date);

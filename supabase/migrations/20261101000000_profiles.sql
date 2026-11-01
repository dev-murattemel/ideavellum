-- Faz 0: profil tablosu, ortak updated_at tetikleyicisi ve RLS.
-- Diğer tablolar (terms, courses, topics, ...) Faz 1'de eklenecek.

-- updated_at alanını her güncellemede tazeleyen ortak fonksiyon
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  timezone text not null default 'Europe/Istanbul',
  locale text not null default 'tr',
  bell_settings jsonb not null default jsonb_build_object(
    'before_minutes', 5,
    'start_bell', true,
    'end_bell', true,
    'sound', 'bell-soft',
    'quiet_hours', jsonb_build_object('enabled', false, 'from', '23:00', 'to', '07:00')
  ),
  notification_prefs jsonb not null default jsonb_build_object(
    'daily_digest_time', '07:30',
    'weekly_report', jsonb_build_object('weekday', 7, 'time', '20:00')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Kullanıcı kendi profilini görür"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "Kullanıcı kendi profilini günceller"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Yeni kullanıcı kaydolduğunda profil satırını otomatik aç
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

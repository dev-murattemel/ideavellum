-- Miktarlı alışkanlık (2 litre su, 20 sayfa), günlük miktar ve not; kaynağa bağlama.
alter table public.habits
  add column target_amount numeric check (target_amount is null or target_amount > 0),
  add column unit text,
  add column resource_id uuid references public.resources on delete set null;

alter table public.habit_checks
  add column amount numeric check (amount is null or amount >= 0),
  add column note text;

-- Kitap defteri: bir kaynaktan alıntılar / vurgular ve kişisel notlar
create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  resource_id uuid not null references public.resources on delete cascade,
  text text not null default '',
  note text,
  page int check (page is null or page >= 0),
  color text not null default 'butter' check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.highlights for each row execute function public.set_updated_at();
alter table public.highlights enable row level security;
create policy "Sahibi erişir" on public.highlights for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.highlights (user_id, resource_id);
create index on public.habits (resource_id);

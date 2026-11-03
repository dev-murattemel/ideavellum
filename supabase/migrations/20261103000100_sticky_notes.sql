-- Mantar pano: aklına geleni hızla yazıp astığın yapışkan notlar; sonra göreve/nota çevrilir ya da toparlanır.
create table public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  text text not null default '',
  color text not null default 'butter' check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate')),
  tags text[] not null default '{}',
  x real not null default 24,
  y real not null default 24,
  z int not null default 0,
  archived_at timestamptz,
  converted_to text check (converted_to in ('task','note')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.sticky_notes for each row execute function public.set_updated_at();
alter table public.sticky_notes enable row level security;
create policy "Sahibi erişir" on public.sticky_notes for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.sticky_notes (user_id, archived_at);

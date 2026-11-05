-- Forum: kategori → başlık → yazılar (blog / eski forum siteleri gibi, tek kişilik)
create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  description text,
  color text not null default 'slate' check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate')),
  course_id uuid references public.courses on delete set null,
  position text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  category_id uuid not null references public.forum_categories on delete cascade,
  title text not null,
  is_pinned boolean not null default false,
  tags text[] not null default '{}',
  last_post_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id uuid not null references public.forum_topics on delete cascade,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.forum_categories for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.forum_topics for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.forum_posts for each row execute function public.set_updated_at();
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
create policy "Sahibi erişir" on public.forum_categories for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Sahibi erişir" on public.forum_topics for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Sahibi erişir" on public.forum_posts for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.forum_categories (user_id);
create index on public.forum_categories (course_id);
create index on public.forum_topics (user_id, category_id);
create index on public.forum_posts (user_id, topic_id);

-- Takvime bir alana bağlı olmayan serbest etkinlik eklenebilsin ("Diş hekimi", "Annemle kahvaltı").
alter table public.class_sessions alter column course_id drop not null;
alter table public.class_sessions
  add column title text,
  add column color text check (color in ('lavender','sky','mint','peach','rose','butter','sage','slate'));
-- Ya bir alana bağlı ya da kendi başlığı olan etkinlik
alter table public.class_sessions
  add constraint class_sessions_course_or_title check (course_id is not null or coalesce(title, '') <> '');

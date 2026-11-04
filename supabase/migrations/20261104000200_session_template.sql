-- Takvim saatinin kalıcı açıklaması ve her seferki kontrol listesi
-- (ör. "Günlük rutin": yüz yıkama, yürüyüş, cilt bakımı, haber okuma). Her gün işaretler ayrı tutulur (session_entries).
alter table public.class_sessions
  add column notes text,
  add column checklist jsonb not null default '[]'::jsonb;

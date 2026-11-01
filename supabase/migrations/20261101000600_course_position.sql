-- Alanların elle sıralanabilmesi (sürükle-bırak). Boş olanlar oluşturulma sırasına göre sona dizilir.
alter table public.courses add column if not exists position text;

-- Not görselleri: herkese açık okunur (adresler tahmin edilemez UUID'lerdir),
-- ama her kullanıcı yalnızca kendi klasörüne (<user_id>/...) yükleyebilir ve silebilir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('note-images', 'note-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Not görseli yükle" on storage.objects for insert to authenticated
  with check (bucket_id = 'note-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Not görselini sil" on storage.objects for delete to authenticated
  using (bucket_id = 'note-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Zamanlanmış işler: Supabase pg_cron + pg_net ile Next.js uç noktalarını çağırır.
-- ÖNEMLİ: Çalıştırmadan önce aşağıdaki iki değeri kendi değerlerinle değiştir:
--   https://UYGULAMA-ADRESI  → Vercel'deki adresin (ör. https://ideavellum.vercel.app)
--   CRON_SECRET_DEGERI       → .env.local / Vercel'deki CRON_SECRET ile aynı

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Her dakika: zamanı gelen hatırlatmaları gönder
select cron.schedule(
  'ideavellum-dispatch',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://UYGULAMA-ADRESI/api/cron/dispatch',
    headers := jsonb_build_object('Authorization', 'Bearer CRON_SECRET_DEGERI', 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- Her gece 03:00 (İstanbul) = 00:00 UTC: 14 günlük pencereyi ileri kaydır
select cron.schedule(
  'ideavellum-extend',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://UYGULAMA-ADRESI/api/cron/extend',
    headers := jsonb_build_object('Authorization', 'Bearer CRON_SECRET_DEGERI', 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);

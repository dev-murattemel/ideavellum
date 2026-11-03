# ideavellum

Hayatını bir üniversite dönemi gibi programlamak için kişisel işletim sistemi: dersler, spor, mutfak, okuma, günlük ve aforizmalar tek yerde. Ürün ve tasarım rehberi: [CLAUDE.md](CLAUDE.md).

## İki sürüm

| Sürüm | Ne işe yarar | Nasıl çalışır |
|---|---|---|
| **Asıl uygulama** (Next.js) | Gerçek kullanım: giriş, Supabase'de saklanan veriler, telefon bildirimi, e-posta, AI | `pnpm dev` / Vercel |
| **Önizleme** (`preview/`) | Tasarımı ve akışları kurulum yapmadan görmek | Tek HTML dosyası; örnek verilerle açılır, veriler tarayıcıda kalır |

Supabase anahtarları girilmemişse asıl uygulama da örnek verilerle **önizleme modunda** açılır.

## Bilgisayarında çalıştırma

1. [Node.js](https://nodejs.org) 22 veya üstünü kur.
2. Proje klasöründe sırayla çalıştır:

   ```bash
   corepack enable
   ```
   ```bash
   pnpm install
   ```
   ```bash
   pnpm dev
   ```

3. Tarayıcıda <http://localhost:3000> adresini aç.

## Kurulum adımları (gerçek kullanım için)

Önce `.env.example` dosyasını kopyalayıp adını `.env.local` yap. Aşağıdaki her adımda bir ya da iki değeri bu dosyaya yapıştıracaksın. Anahtarlar sadece `.env.local` içinde (ve Vercel'de) durur; git'e girmez.

### 1. Supabase (veritabanı ve giriş)

1. <https://supabase.com> → **Start your project** → GitHub ile giriş yap.
2. **New project** → ad: `ideavellum`, bölge: **Central EU (Frankfurt)**, güçlü bir veritabanı şifresi → **Create new project**.
3. Sol menü **SQL Editor** → **New query**. `supabase/migrations/` klasöründeki dosyaları **sırayla** yapıştırıp **Run**'a bas:
   1. `20261101000000_profiles.sql`
   2. `20261101000100_core_schema.sql`
   3. `20261101000300_lock_handle_new_user.sql`
   4. `20261101000400_note_images.sql`
   5. `20261101000500_areas_journal_quotes.sql`
   6. `20261101000600_course_position.sql`
   7. `20261101000700_habits.sql`
   8. `20261102000100_session_entries.sql`
   9. `20261103000100_sticky_notes.sql`
  10. `20261101000200_cron.sql` → bunu en sona bırak (aşağıda 5. adım).
4. **Project Settings → API Keys**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon / publishable anahtar → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role / secret anahtar → `SUPABASE_SERVICE_ROLE_KEY` (gizli; kimseyle paylaşma)
5. **Authentication → URL Configuration**: Site URL `http://localhost:3000`, Redirect URLs'e `http://localhost:3000/auth/callback` ekle. Vercel'e yükledikten sonra aynısını Vercel adresinle de ekle.

### 2. Vercel (yayın)

1. Projeyi GitHub'a yükle.
2. <https://vercel.com> → **Add New → Project** → depoyu seç.
3. **Environment Variables** bölümüne `.env.local` içindeki tüm değerleri tek tek gir. `APP_URL` olarak Vercel'in verdiği adresi yaz (ör. `https://ideavellum.vercel.app`).
4. **Deploy**.

### 3. E-posta (Resend)

1. <https://resend.com> → kaydol → **API Keys → Create API Key** → `RESEND_API_KEY`.
2. **Domains → Add Domain** ile kendi alan adını doğrula; `EMAIL_FROM` örneği: `ideavellum <zil@alanadin.com>`. Alan adın yoksa denemek için `onboarding@resend.dev` kullanabilirsin (sadece kendi e-postana gönderir).

### 4. Telefon bildirimleri (Web Push)

1. Terminalde çalıştır ve çıkan iki anahtarı kopyala:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Public Key → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, Private Key → `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:senin@epostan.com`.
3. Uygulamada **Ayarlar → Telefon bildirimleri → Bu cihazda bildirimleri aç**. iPhone'da önce Safari → Paylaş → **Ana Ekrana Ekle**.

### 5. Zamanlanmış işler (zil, sabah özeti, haftalık rapor)

1. `CRON_SECRET` için en az 16 karakterlik rastgele bir metin yaz (ör. bir şifre üreticisinden).
2. `supabase/migrations/20261101000200_cron.sql` dosyasındaki `https://UYGULAMA-ADRESI` ve `CRON_SECRET_DEGERI` yazılarını kendi değerlerinle değiştir, sonra SQL Editor'de çalıştır.
3. Supabase artık her dakika `/api/cron/dispatch`, her gece 03:00'te `/api/cron/extend` adresini çağırır.

### 6. AI asistan (isteğe bağlı)

1. <https://platform.claude.com> → **API Keys → Create Key** → `ANTHROPIC_API_KEY`.
2. `AI_ENABLED=true` yap. `ANTHROPIC_MODEL` boş kalırsa `claude-opus-5-5` kullanılır.
3. Uygulamada **Ayarlar → AI asistan** anahtarını aç. Kapalıyken hiçbir veri gönderilmez.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Yayın derlemesi |
| `pnpm lint` | Kod kurallarını kontrol eder |
| `pnpm preview:build` | Önizlemeyi tek HTML dosyası olarak `preview-dist/` içine üretir |

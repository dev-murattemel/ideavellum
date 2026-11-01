# ideavellum

Hayatını bir üniversite dönemi gibi programlamak için kişisel öğrenme işletim sistemi. Ürün ve tasarım rehberi için [CLAUDE.md](CLAUDE.md) dosyasına bak.

## Bilgisayarında çalıştırma

1. [Node.js](https://nodejs.org) (22 veya üstü) kur.
2. Terminalde proje klasörüne gir ve şunları çalıştır:

   ```bash
   corepack enable
   pnpm install
   pnpm dev
   ```

3. Tarayıcıda <http://localhost:3000> adresini aç.

Supabase anahtarları girilmeden uygulama **kurulum modunda** açılır: giriş kapalıdır, arayüzü gezebilirsin.

## Supabase bağlantısı (giriş için gerekli)

1. <https://supabase.com> → **Start your project** → GitHub ile giriş yap.
2. **New project** → ad: `ideavellum`, bölge: **Central EU (Frankfurt)**, güçlü bir veritabanı şifresi belirle → **Create new project**.
3. Proje açılınca sol menüden **SQL Editor** → **New query** → `supabase/migrations/20261101000000_profiles.sql` dosyasının içeriğini yapıştır → **Run**.
4. Sol menü **Project Settings → API Keys** (eski adı **API**):
   - **Project URL** değerini `NEXT_PUBLIC_SUPABASE_URL` olarak,
   - **anon / publishable** anahtarını `NEXT_PUBLIC_SUPABASE_ANON_KEY` olarak kopyala.
5. Sol menü **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs** → **Add URL**: `http://localhost:3000/auth/callback`
6. Proje klasöründe `.env.example` dosyasını kopyalayıp adını `.env.local` yap, iki değeri yapıştır, `pnpm dev`'i yeniden başlat.

> Anahtarlar sadece `.env.local` içinde durur; bu dosya git'e girmez.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Geliştirme sunucusu (değişiklikler anında görünür) |
| `pnpm build` | Yayın için derleme |
| `pnpm lint` | Kod kurallarını kontrol eder |

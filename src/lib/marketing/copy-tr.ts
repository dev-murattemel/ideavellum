import type { Copy } from "./copy";

export const tr: Copy = {
  meta: {
    title: "ideavellum: kendi üniversiteni tasarla",
    description:
      "Hayatını bir üniversite dönemi gibi programla. Dersler, ders saatleri, zamanında çalan zil, notlar, alışkanlıklar, karne ve bitirdiklerinin transkripti.",
  },
  nav: { features: "Özellikler", pricing: "Fiyatlar", faq: "Sorular", login: "Giriş yap", start: "Ücretsiz başla" },
  hero: {
    badge: "Erken erişim · geliştirme sürecinde ücretsiz",
    title: "Kendi üniversiteni tasarla.",
    lead:
      "ideavellum öğrenmek istediklerini 12 haftalık bir döneme çevirir: haftalık ders saatleri olan dersler, ne zaman başlayacağını söyleyen bir zil ve nasıl gittiğini gösteren bir karne.",
    primary: "İlk dönemini başlat",
    secondary: "Nasıl çalışır?",
    note: "Başlamak için hesap gerekmez. Verilerin cihazında kalabilir.",
    alt: "Bugün ekranı: günün önerileri, geri sayımlı sıradaki ders ve alışkanlıklar",
  },
  areas: {
    title: "Sadece okul değil. Gelişmek istediğin her şey.",
    items: ["Diller", "Felsefe", "Koşu", "Mutfak", "Piyano", "Okuma listeleri", "Kuran", "Yan projeler"],
  },
  features: {
    title: "Bir dönemin ihtiyacı olan her şey, ekip işi yok",
    lead: "Sakin, tek kişilik bir çalışma alanı. Kanal yok, rol yok, gürültü yok.",
    items: [
      { title: "Haftalık program", text: "Ders saatlerini 15 dakikalık ızgarada sürükle. Haftalık, iki haftada bir, aylık ya da tek sefer." },
      { title: "Çalan bir zil", text: "Her dersten önce ve başlarken yumuşak bir zil; bilgisayarında ve telefonunda." },
      { title: "Pano ve görevler", text: "Yapılacak, devam ediyor, gözden geçir, bitti. Her kart kendi dersinin renginde." },
      { title: "Notlar ve kaynaklar", text: "Görselli, etiketli notlar; çalıştığın videolar, kitaplar ve makaleler." },
      { title: "Odak zamanlayıcısı", text: "Pomodoro turları; çalışma süren otomatik olarak doğru derse yazılır." },
      { title: "Günlük ve alışkanlıklar", text: "Günde bir sayfa, ruh hâlin, kendi aforizmaların ve 12 haftalık alışkanlık haritası." },
    ],
  },
  showcase: [
    {
      eyebrow: "Ders sayfası",
      title: "Her dersin bir evi var",
      text: "Hedef, program, konular, görevler, notlar ve kaynaklar dersin kendi rengi altında bir arada.",
      points: ["Bu haftanın ders saatleri tek bakışta", "Sürükleyerek sıralanan konular", "Çalıştıkça güncellenen toplam süre"],
      image: "/marketing/course.webp",
      alt: "Renkli başlığı, sekmeleri ve bu haftanın programıyla bir ders sayfası",
    },
    {
      eyebrow: "Karne",
      title: "Sadece günü değil, dönemi gör",
      text: "Haftalık ve aylık görünüm, planladığın süreyle ayırdığın süreyi ders ders karşılaştırır.",
      points: ["Her ders için hedef ve gerçekleşen", "Yoklama oranı ve biten konular", "Düzenli gelmeyi ödüllendiren seri takvimi"],
      image: "/marketing/report.webp",
      alt: "Karne: haftalık toplamlar, ders bazında hedef ve gerçekleşen, günlük grafik",
    },
    {
      eyebrow: "Alışkanlıklar",
      title: "Her gün küçük şeyler",
      text: "Dönemini bir arada tutan günlük alışkanlıkları işaretle, serilerin büyüsün.",
      points: ["Tek dokunuşla işaretle", "Her alışkanlık için seri sayısı", "On iki haftalık geçmiş tek görünümde"],
      image: "/marketing/habits.webp",
      alt: "İşaretler, seriler ve ısı haritasıyla alışkanlıklar sayfası",
    },
  ],
  how: {
    title: "Nasıl çalışır?",
    steps: [
      { title: "Bir dönem aç", text: "On iki hafta iyi bir başlangıç. Ona bir ad ver, ör. “2026 Güz”." },
      { title: "Derslerini ekle", text: "Bir renk ve tür seç, sonra haftalık ders saatlerini programa ekle." },
      { title: "Derse gir", text: "Zil çalar, çalışırsın, karne kendiliğinden dolar. Biten dersler transkriptine geçer." },
    ],
  },
  pricing: {
    title: "Sade fiyatlar",
    lead: "Cihazında ücretsiz başla. Dönemini her yerde istediğinde yükselt.",
    monthly: "Aylık",
    yearly: "Yıllık",
    perMonth: "/ ay",
    perYear: "/ yıl",
    save: (n) => `%${n} tasarruf`,
    early: "Erken erişim: şu an tüm özellikler ücretsiz. Ücretli planlar önceden duyurulacak.",
    free: {
      name: "Ücretsiz",
      tagline: "Odaklı tek bir dönem için",
      cta: "Ücretsiz başla",
      items: ["Veriler cihazında kalır", "1 aktif dönem, en fazla 3 ders", "Program, pano, notlar ve günlük", "Uygulama içi zil ve odak zamanlayıcısı", "Seçtiğin dosyaya yedek"],
    },
    premium: {
      name: "Premium",
      tagline: "Ömür boyu süren bir müfredat için",
      cta: "Bugün ücretsiz başla",
      soon: "Yakında",
      items: ["Tüm cihazlarında eşitleme", "Sınırsız dönem ve ders", "Telefon ve e-posta hatırlatmaları", "Tam karne ve transkript dışa aktarımı", "Akıllı haftalık planlama"],
    },
  },
  faq: {
    title: "Sorular",
    items: [
      { q: "Hesap açmam gerekiyor mu?", a: "Hayır. “Sadece bu cihazda” seçeneğiyle hemen başla. Verilerin tarayıcında ve istersen bilgisayarındaki bir dosyada durur. Sonradan bulut hesabına taşıyabilirsin." },
      { q: "Verilerim nerede saklanıyor?", a: "Cihaz modunda hiçbir şey cihazından çıkmaz. Bulut modunda verilerin veritabanımızda (Supabase) saklanır ve yalnızca senin hesabın okuyabilecek şekilde korunur." },
      { q: "Telefonda çalışır mı?", a: "Evet. ideavellum'u telefonunun tarayıcısında aç ve ana ekrana ekle. Böylece uygulama gibi çalışır ve hatırlatma gönderebilir." },
      { q: "Sadece öğrenciler için mi?", a: "Hayır. Bir “ders” bir dil, bir antrenman planı, bir tarif koleksiyonu, bir okuma listesi ya da manevi bir pratik olabilir. Her tür kendi kelimelerini kullanır." },
      { q: "Verilerimi dışa aktarabilir miyim?", a: "İstediğin zaman. Ayarlar → Veriler ve yedek, yazdığın her şeyi tek bir JSON dosyası olarak verir." },
      { q: "Ücretli planlar gelince ne olacak?", a: "Önceden haber vereceğiz. Ücretsiz plan ücretsiz kalır ve oluşturduğun hiçbir şeyi kaybetmezsin." },
    ],
  },
  cta: { title: "Bir sonraki dönemin bugün başlıyor.", text: "İlk dersini kurmak yaklaşık iki dakika sürer.", button: "Ücretsiz başla" },
  footer: { tagline: "Tek kişilik, sakin bir çalışma sistemi.", privacy: "Gizlilik", terms: "Koşullar", refund: "İade", contact: "İletişim", language: "English" },
};

import type { LegalDocs } from "./legal";

/** {contact} yerine destek e-postası (ya da yedek ifade) yazılır. */
export const legalTr: LegalDocs = {
  updated: "Son güncelleme: 2 Kasım 2026",
  contactFallback: "bu sayfada yayımlanacak iletişim adresi",
  privacy: {
    title: "Gizlilik politikası",
    intro: "ideavellum kişisel bir çalışma planlayıcısıdır. Bu sayfa neyi, neden sakladığımızı ve bu konuda neler yapabileceğini anlatır. Kısacası: notların senindir, veri satmayız, reklam göstermeyiz.",
    sections: [
      { h: "Verilerini saklamanın iki yolu", p: [
        "Sadece bu cihazda: ideavellum'u hesapsız kullanırsın. Yazdığın her şey tarayıcında (IndexedDB) ve istersen bilgisayarındaki bir dosyada saklanır. Sunucularımıza hiç ulaşmaz.",
        "Bulutta: e-posta adresinle giriş yaparsın. Verilerin, her cihazdan açabilmen için veritabanımızda saklanır. Her kayıt hesabına bağlıdır ve satır düzeyinde güvenlikle korunur; yalnızca senin hesabın okuyabilir.",
      ] },
      { h: "Bulut modunda topladıklarımız", p: [
        "E-posta adresin (tek kullanımlık bağlantıyla giriş için), profil ayarların (ad, saat dilimi, zil ve bildirim tercihleri) ve oluşturduğun içerik: dönemler, dersler, ders saatleri, görevler, notlar, görseller, kaynaklar, çalışma süreleri, günlük sayfaları, sözler ve alışkanlıklar.",
        "Telefon bildirimlerini açarsan tarayıcının verdiği bildirim aboneliğini saklarız. Konumunu, rehberini ya da başka uygulamalardaki verilerini toplamayız.",
      ] },
      { h: "Hizmet sağlayıcılar", p: [
        "Hizmeti az sayıda sağlayıcıyla yürütürüz: Supabase (veritabanı, giriş ve dosya depolama), Vercel (barındırma), Resend (e-posta hatırlatmaları) ve tarayıcı üreticinin bildirim servisi (telefon bildirimleri).",
        "İsteğe bağlı yapay zekâ özellikleri varsayılan olarak kapalıdır. Açarsan yalnızca istediğin işlem için gereken metin Anthropic'e gönderilir ve model eğitiminde kullanılmaz.",
        "Ücretli planlar başladığında ödemeler, satıcımız ve Merchant of Record olarak Paddle.com tarafından alınır. Kart bilgilerinin tamamını hiçbir zaman görmeyiz.",
      ] },
      { h: "Çerezler ve yerel depolama", p: [
        "Yalnızca uygulamanın çalışması için gereken çerezleri kullanırız: oturumun ve saklama tercihin (cihaz ya da bulut). Reklam çerezi ya da siteler arası izleyici kullanmayız. İleride gizliliğe saygılı bir ürün analitiği eklersek önce bu sayfayı güncelleriz.",
      ] },
      { h: "Hakların", p: [
        "Ayarlar → Veriler ve yedek bölümünden her şeyi istediğin zaman dışa aktarabilirsin. Hesabının ve verilerinin düzeltilmesini ya da silinmesini {contact} adresine yazarak isteyebilirsin; 30 gün içinde yerine getiririz.",
        "6698 sayılı KVKK ve (AB/AEA'daysan) GDPR kapsamında erişim, düzeltme, silme, işlemeyi kısıtlama, taşınabilirlik ve itiraz hakların vardır. Kişisel Verileri Koruma Kurulu'na ya da yerel veri koruma otoritene şikâyette bulunabilirsin.",
      ] },
      { h: "Saklama süresi ve güvenlik", p: [
        "Verilerini hesabın açık olduğu sürece saklarız. Hesabını silersen verilerin canlı veritabanından kaldırılır ve 30 gün içinde yedeklerden de silinir. Veriler sağlayıcılarımız tarafından aktarım sırasında ve depoda şifrelenir.",
      ] },
      { h: "Çocuklar", p: ["ideavellum 13 yaşından küçük çocuklara yönelik değildir ve bilerek onların verisini toplamayız."] },
      { h: "Değişiklikler", p: ["Bu politikayı önemli ölçüde değiştirirsek, yürürlüğe girmeden önce uygulama içinde ya da e-postayla haber veririz."] },
      { h: "İletişim", p: ["Gizlilikle ilgili sorular: {contact}."] },
    ],
  },
  terms: {
    title: "Kullanım koşulları",
    intro: "Bu koşullar ideavellum'u kullandığında geçerlidir. Hizmeti kullanarak bunları kabul etmiş olursun.",
    sections: [
      { h: "Hizmet", p: [
        "ideavellum çalışma ve kişisel gelişim için kişisel bir planlayıcıdır. Şu an erken erişimdedir: özellikler değişebilir; bazıları önceden haber verilerek eklenebilir, kaldırılabilir ya da ücretli plana taşınabilir.",
      ] },
      { h: "Hesabın ve içeriğin", p: [
        "ideavellum'a yazdığın her şey senindir. Bize yalnızca onu saklamak, yedeklemek ve sana göstermek için gereken izni verirsin. Giriş yaptığın e-postanın güvenliğinden sen sorumlusun.",
        "Cihaz modunda verilerin yalnızca cihazında durur. Tarayıcı verilerini temizlemek onları silebilir; bu yüzden bir yedek dosyası tut.",
      ] },
      { h: "Kabul edilebilir kullanım", p: [
        "ideavellum'u yasaları çiğnemek, hakkın olmayan içeriği saklamak, hizmete saldırmak ya da aşırı yüklemek veya başkalarının verilerine erişmeye çalışmak için kullanma.",
      ] },
      { h: "Ücretli planlar", p: [
        "Ücretli planlar başladığında fiyatlar satın almadan önce gösterilir. Satın almalar satıcımız ve Merchant of Record olan Paddle.com tarafından işlenir; ödeme için Paddle'ın alıcı koşulları geçerlidir. Abonelikler iptal edene kadar otomatik yenilenir; istediğin zaman iptal edebilir ve ödediğin dönemin sonuna kadar kullanmaya devam edebilirsin.",
      ] },
      { h: "Erişilebilirlik ve garanti", p: [
        "ideavellum'u erişilebilir ve verilerini güvende tutmak için çok çalışırız; yine de hizmet “olduğu gibi”, herhangi bir garanti olmaksızın sunulur. Önemli her şeyin kendi yedeğini al.",
      ] },
      { h: "Sorumluluğun sınırı", p: [
        "Yasaların izin verdiği ölçüde dolaylı zararlardan sorumlu değiliz ve toplam sorumluluğumuz, talepten önceki 12 ayda bize ödediğin tutarla sınırlıdır. Bu koşullar, tüketici olarak ülkenin yasalarından doğan haklarını kısıtlamaz.",
      ] },
      { h: "Sona erme", p: [
        "ideavellum'u bırakabilir ve hesabını istediğin zaman silebilirsin. Bu koşulları ciddi biçimde ihlal eden hesapları askıya alabiliriz; mümkünse önceden haber verir ve verilerini dışa aktarma fırsatı tanırız.",
      ] },
      { h: "Uygulanacak hukuk", p: ["Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir; yaşadığın yerdeki zorunlu tüketici korumaları saklıdır."] },
      { h: "İletişim", p: ["Bu koşullarla ilgili sorular: {contact}."] },
    ],
  },
  refund: {
    title: "İade politikası",
    intro: "ideavellum erken erişim süresince ücretsizdir, yani bugün iade edilecek bir şey yok. Ücretli planlar başladığında iadeler şöyle işleyecek.",
    sections: [
      { h: "14 gün para iade garantisi", p: [
        "Premium'dan memnun kalmazsan ilk ödemenden sonraki 14 gün içinde iade iste, tamamını geri al. Soru sorulmaz.",
      ] },
      { h: "Yenilemeler", p: [
        "İstediğin zaman iptal edebilirsin; planın ödediğin dönemin sonuna kadar açık kalır. Yıllık yenileme seni şaşırttıysa yenilemeden sonraki 14 gün içinde iste, iade ederiz.",
      ] },
      { h: "Nasıl istenir?", p: [
        "Ödemeler Merchant of Record'umuz Paddle.com tarafından alınır. Paddle makbuz e-postasını yanıtla, siparişini paddle.net üzerinden bul ya da {contact} adresine yaz. İade, ödemenin yapıldığı yönteme genellikle 5–10 iş günü içinde yapılır.",
      ] },
    ],
  },
};

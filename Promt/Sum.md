# Kırşehir Görme Engelliler Derneği Web Sitesi v1 Planı

## Özet
- Mevcut çalışma alanı boş; uygulama sıfırdan kurulacak. Teknik temel `Vite` tabanlı, çok sayfalı, dependency-light statik site olacak ve ilk yayın `Vercel` preview/production akışıyla yapılacak.
- v1 kapsamı `MVP + kritik erişilebilirlik`: `Ana Sayfa`, `Hakkımızda`, `Tüzük`, `İletişim`, özel `404`, SEO dosyaları, dark mode, erişilebilirlik araç çubuğu, loader, mobil uyumluluk ve temel güvenlik başlıkları.
- İlk sürümde gerçek iletişim formu olmayacak. İletişim telefon/e-posta odaklı olacak; harita ve tam adres doğrulanana kadar kontrollü pasif durumda tutulacak.
- Eksik kurumsal içerikler için yer tutucu kullanılacak; ancak yanlış bilgi riski olan alanlarda placeholder yerine açık durum mesajı kullanılacak. Özellikle harita, tam adres, koordinat ve tüzük belgesi için sahte/veri uyduran içerik üretilmeyecek.

## Uygulama Planı
- Proje `Vite` MPA olarak kurulacak. Çekirdek yapı: `src/` altında sayfa girişleri, ortak bileşenler, tekil tema/stil katmanı ve sade içerik verisi; `public/` altında logo, favicon, manifest, OG görseli ve ileride gelecek belge/görseller.
- CSS yaklaşımı `Vanilla CSS + custom properties` olacak. Tasarım sistemi baştan sabitlenecek: açık tema, dark tema, high-contrast tema, focus token’ları, spacing scale, type scale ve responsive breakpoint’ler tek merkezden yönetilecek. Animasyonlar yalnızca CSS ve küçük vanilla JS ile yapılacak; `prefers-reduced-motion` her dinamik davranışta zorunlu olacak.
- Ortak bileşenler tek kez üretilip tüm sayfalarda yeniden kullanılacak: `skip link`, header/nav, mobile menu, breadcrumb, footer, CTA butonları, alert kutuları, hızlı erişim bağlantıları ve erişilebilirlik araç çubuğu. Header sticky olacak; mobil menü `Escape`, dış tıklama ve focus yönetimi ile kapanacak.
- Sayfa rotaları sabitlenecek: `/`, `/hakkimizda/`, `/tuzuk/`, `/iletisim/`, `/404.html`. Her sayfa kendi `title`, `description`, canonical, OG/Twitter meta ve `WebPage` JSON-LD verisini taşıyacak. İç sayfalarda breadcrumb görünür olacak.
- İçerik yönetimi teknik olmayan güncelleyici düşünülerek sadeleştirilecek. Tek bir okunabilir içerik kaynağı tutulacak:
  - `src/data/site-content.json`: dernek adı, slogan, telefon, e-posta, sosyal bağlantılar, durum metinleri, CTA etiketleri, misyon kartları, tarihçe placeholder’ları, tüzük durumu, adres durumu, SEO metinleri.
  - İçerik yoksa bileşenler “veri yok” durumunu erişilebilir biçimde işler; boş alan veya kırık link üretmez.
- Ana sayfa; hero, misyon kartları, hızlı erişim aksiyonları ve kısa iletişim özetiyle kurulacak. Hero görseli gelene kadar erişilebilir dekoratif illüstrasyon/gradient arka plan kullanılacak; logo geldiğinde kolay değiştirilecek.
- `Hakkımızda` sayfası placeholder tanıtım metni, tarihçe alanı, amaç/faaliyet listesi ve opsiyonel yönetim bölümü için hazır bloklarla gelecek. Veri yoksa bölüm başlığı korunur, içerikte “güncelleniyor” açıklaması gösterilir.
- `Tüzük` sayfası ilk sürümde yayınlanacak fakat belge yoksa kullanıcıya açık durum mesajı ve belge geldiğinde bu sayfadan indirilebileceği bilgisi verilecek. PDF veya HTML tüzük desteği için yapı hazır olacak; belge geldikten sonra menü ve route değişmeden içerik aktive edilecek.
- `İletişim` sayfasında tıklanabilir telefon, e-posta ve doğrulanma durumu belirtilen adres alanı bulunacak. Harita embed’i varsayılan olarak kapalı olacak; koordinatlar onaylandığında aynı bileşen üzerinden etkinleştirilecek. WhatsApp ancak resmi numara doğrulanırsa gösterilecek.
- Erişilebilirlik araç çubuğu v1’de tam gelecek: font büyütme, high contrast, grayscale, dyslexia-friendly font, dark/light override ve reset. Tercihler `localStorage` içinde sabit anahtarlarla saklanacak ve ilk yüklemede hydrate edilecek. Klavye erişimi ve ekran okuyucu etiketleri zorunlu.
- Loader yalnızca ilk sayfa yüklemesinde çalışacak; ekran okuyucudan gizli olacak, `800–1500ms` aralığında kapanacak, reduced-motion’da atlanacak ve kapandıktan sonra DOM’dan kaldırılacak.
- Güvenlik ve dağıtım için `Vercel` yapılandırması HTTPS yönlendirme, güvenlik header’ları, temel CSP, `robots.txt`, `sitemap.xml`, `site.webmanifest` ve cache-friendly asset stratejisini içerecek. `.org.tr` domain bağlama ayrı bir post-v1 iş paketi olacak; önce preview URL ile test yapılacak.
- Dokümantasyon iki parçalı hazırlanacak: kısa teknik `README.md` ve teknik olmayan kişi için “hangi JSON alanı neyi değiştirir” odaklı güncelleme rehberi.

## Dış Arayüzler ve Kalıcı Kararlar
- Public route’lar: `/`, `/hakkimizda/`, `/tuzuk/`, `/iletisim/`, `/404.html`.
- İçerik sözleşmesi: tüm sayfalar ortak `site-content.json` verisini okur; eksik alanlar için fallback metin gösterir, link üretmez.
- Local storage anahtarları sabitlenecek: tema tercihi, font ölçeği, high contrast, grayscale, dyslexia font.
- Harita arayüzü feature-flag benzeri çalışacak: doğrulanmış `address` ve `geo` yoksa embed render edilmez.
- SEO/Schema çıktıları iki seviyeli olacak: `Organization` her sayfada, `LocalBusiness` yalnızca doğrulanmış adres ve koordinatlar geldiğinde aktif.

## Test Planı
- Klavye testi: skip link, sticky nav, mobile menu, toolbar, breadcrumb ve tüm CTA’lar yalnız klavyeyle gezilir; focus kaybı olmaz.
- Ekran okuyucu testi: landmark yapısı, tek `h1`, buton etiketleri, menü durumu, loader gizliliği ve toolbar duyuruları NVDA/Chrome temel senaryosunda doğrulanır.
- Responsive testi: `320px`, `480px`, `768px`, `1024px`, `1280px` kırılımlarında yatay scroll oluşmaz; 400% zoom’da içerik bozulmaz.
- Tema testi: dark mode, high contrast, grayscale ve font büyütme kombinasyonları birlikte çalışır; sayfa yenilemede korunur.
- SEO/perf testi: Lighthouse hedefleri `Performance >= 90`, `Accessibility >= 95`, `SEO >= 95`; `robots.txt`, `sitemap.xml`, canonical ve OG meta her rotada doğrulanır.
- Güvenlik testi: response header’larında HTTPS yönlendirme, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` ve minimum çalışır CSP doğrulanır.
- İçerik durumu testi: logo yok, tüzük yok, adres yok, sosyal medya yok senaryolarında UI kırılmaz; kullanıcıya açık ve doğru durum mesajı gösterilir.

## Varsayımlar
- Teknoloji kararı sabit: `Vite` çok sayfalı statik site, vanilla JS, vanilla CSS, ek framework yok.
- Hosting kararı sabit: ilk dağıtım `Vercel`; özel domain sonradan bağlanacak.
- İlk sürümde gerçek form gönderimi yok; telefon ve e-posta birincil iletişim kanalları.
- Harita yaklaşık veriye göre gösterilmeyecek; doğrulama gelene kadar kapalı kalacak.
- Logo dosyası sonradan gelecek; geçici çözüm erişilebilir metin logotype olacak.
- Tüzük sayfası yayında olacak ama belge yoksa indirilebilir dosya sunulmayacak.
- Bonus maddeler, admin paneli, bağış entegrasyonu, çok dil, analytics ve Google Business operasyonları v1 kapsamı dışında tutulacak; bunlar v2/backlog olarak ayrılacak.

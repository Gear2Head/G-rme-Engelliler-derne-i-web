# 📋 Kırşehir Görme Engelliler Derneği — Kapsamlı Geliştirme TODO Listesi

> **Not:** Tüm kodlama AI tarafından yapılacaktır. Bu liste; sprint planı, kontrol noktası ve teknik rehber olarak kullanılır.
> Öncelik sırası yukarıdan aşağıya doğrudur.

---

## 📁 FAZA 0 — PROJE KURULUMU & İÇERİK TOPLAMA

### 0.1 Bilgi & Varlık Toplama
- [ ] Dernek adı kesin yazım şekli onayı: `Kırşehir Görme Engelliler Derneği`
- [ ] Logo dosyası alınması (SVG tercih, yoksa PNG yüksek çözünürlük)
- [ ] Logo yoksa → metin tabanlı logotype kararı verilmesi
- [ ] Renk paleti belirlenmesi (marka varsa mevcut renkler, yoksa WCAG AAA uyumlu öneri)
- [ ] Telefon numarası doğrulama: `0541 648 45 70`
- [ ] E-posta adresi doğrulama: `gormeengellilerdernegi@hotmail.com`
- [ ] Fiziksel adres tam metin alınması (mahalle, cadde, kapı no, posta kodu)
- [ ] Google Maps koordinatları doğrulama (enlem / boylam)
- [ ] "Hakkımızda" metni — sonradan doldurulacak yer tutucusu
- [ ] Tüzük belgesi teslimi (PDF veya ham metin)
- [ ] Dernek kuruluş yılı ve tarihçe özeti
- [ ] Yönetim kurulu bilgileri (isim, unvan — isteğe bağlı)
- [ ] Varsa sosyal medya hesap bağlantıları (Facebook, Instagram, Twitter/X)
- [ ] Varsa WhatsApp Business numarası
- [ ] Hero alanı için kullanılacak fotoğraf veya illüstrasyon kararı

### 0.2 Domain & Hosting Planlaması
- [ ] `.org.tr` domain müsaitlik sorgusu
- [ ] Domain satın alma (NIC.tr üzerinden — dernek kararı gerekli)
- [ ] Hosting seçimi: Vercel / Netlify / klasik hosting karşılaştırması
- [ ] DNS kayıtları yapılandırma planı (A, CNAME, MX)
- [ ] SSL/TLS sertifikası aktivasyon planı (Let's Encrypt veya hosting sağlayıcı)
- [ ] Cloudflare CDN kurulum planı
- [ ] E-posta için MX kaydı (opsiyonel — kurumsal mail açılacaksa)

---

## 🏗️ FAZA 1 — MİMARİ & TEKNİK ALTYAPI

### 1.1 Tech Stack Kararı
- [ ] Framework seçimi: Statik HTML/CSS/JS mi, Next.js mi?
- [ ] CSS yaklaşımı: Vanilla CSS / Tailwind / CSS Modules
- [ ] Animasyon kütüphanesi: GSAP mi, CSS Animations mi?
- [ ] Versiyon kontrol: Git repo oluşturma (GitHub / GitLab)
- [ ] Dosya/klasör mimarisi oluşturma:
  - [ ] `/pages` veya `/src` dizin yapısı
  - [ ] `/public/assets` (görseller, fontlar, ikonlar)
  - [ ] `/components` (tekrar kullanılabilir bileşenler)
  - [ ] `/styles` (global CSS, değişkenler)
  - [ ] `/data` (JSON içerik dosyaları)

### 1.2 HTML Temel Yapısı
- [ ] `<!DOCTYPE html>` ve `<html lang="tr">` doğru tanımı
- [ ] `<meta charset="UTF-8">` tanımı
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` tanımı
- [ ] Favicon tanımı (32x32 PNG, SVG favicon)
- [ ] Apple Touch Icon tanımı (180x180)
- [ ] Manifest dosyası (`site.webmanifest`) oluşturma
- [ ] Temel sayfa şablonu (template) oluşturma

### 1.3 CSS Altyapısı
- [ ] CSS custom properties (değişkenler) tanımı:
  - [ ] `--color-primary` (ana marka rengi)
  - [ ] `--color-secondary`
  - [ ] `--color-bg` ve `--color-bg-alt`
  - [ ] `--color-text` ve `--color-text-muted`
  - [ ] `--color-focus` (klavye focus rengi)
  - [ ] `--font-heading` ve `--font-body`
  - [ ] `--spacing-*` (4px, 8px, 16px, 24px, 32px, 48px, 64px)
  - [ ] `--radius-*` (border-radius değerleri)
  - [ ] `--shadow-*` (gölge değerleri)
  - [ ] `--transition-speed`
- [ ] CSS reset / normalize entegrasyonu
- [ ] `prefers-color-scheme: dark` CSS media query altyapısı
- [ ] `prefers-reduced-motion: reduce` CSS media query altyapısı
- [ ] Grid ve flexbox yardımcı sınıfları
- [ ] Responsive breakpoint tanımları (320px, 480px, 768px, 1024px, 1280px, 1440px)

---

## ♿ FAZA 2 — ERİŞİLEBİLİRLİK (KRİTİK — HER ADIM ZORUNLU)

### 2.1 Semantic HTML
- [ ] `<header>` — site başlığı ve navigasyon
- [ ] `<nav aria-label="Ana menü">` — navigasyon bölgesi
- [ ] `<main id="main-content">` — ana içerik alanı
- [ ] `<section>` — her içerik bölümü ayrı section
- [ ] `<article>` — bağımsız içerik blokları
- [ ] `<aside>` — yan içerik (varsa)
- [ ] `<footer>` — sayfa altbilgisi
- [ ] `<h1>` — sayfada yalnızca bir adet, dernek adı
- [ ] `<h2>`, `<h3>` hiyerarşisi doğru sıralanmış
- [ ] `<p>`, `<ul>`, `<ol>`, `<li>` doğru kullanımı
- [ ] `<address>` etiketi iletişim bilgileri için
- [ ] `<time datetime="...">` tarih gösterimi için
- [ ] `<figure>` ve `<figcaption>` görseller için
- [ ] Tablo varsa `<thead>`, `<tbody>`, `<th scope="col/row">` kullanımı

### 2.2 ARIA Uygulamaları
- [ ] `aria-label` — tüm ikonlu butonlara
- [ ] `aria-labelledby` — section başlıklarıyla ilişkilendirme
- [ ] `aria-describedby` — form alanları için açıklama bağlantısı
- [ ] `aria-live="polite"` — dinamik değişen içerikler için
- [ ] `aria-hidden="true"` — dekoratif görseller ve ikonlar için
- [ ] `aria-expanded` — menü toggle butonuna
- [ ] `aria-controls` — toggle ile ilgili içerik ilişkisi
- [ ] `aria-current="page"` — aktif menü öğesine
- [ ] `role="alert"` — hata / uyarı mesajları için
- [ ] `role="dialog"` — modal pencere varsa
- [ ] `role="search"` — arama formu varsa
- [ ] Loader için `aria-hidden="true"` (ekran okuyucudan gizle)
- [ ] Skip link için `aria-label="İçeriğe atla"` tanımı

### 2.3 Klavye Navigasyonu
- [ ] Skip to Content linki — sayfanın ilk elementi
  - [ ] Varsayılan gizli, `:focus` ile görünür
  - [ ] `#main-content` hedefine atlar
- [ ] Tab sırası (`tabindex`) mantıksal akışta
- [ ] Negatif `tabindex` (-1) — klavye sırası dışı tutulacak elementler
- [ ] Tüm interaktif elementler klavye ile erişilebilir
- [ ] Dropdown menü klavye ile açılıp kapanabilir (Enter, Space, Escape)
- [ ] Modal varsa klavye hapsi (focus trap)
- [ ] Escape tuşu ile modal / dropdown kapanır
- [ ] Arrow key navigasyonu menüde çalışır

### 2.4 Focus Yönetimi
- [ ] `outline: none` kullanımı tamamen kaldırılmış
- [ ] `:focus-visible` ile özel focus halkası:
  - [ ] Minimum 3px kalınlık
  - [ ] Yüksek kontrast renk (orange / yellow önerilir)
  - [ ] `outline-offset: 2px`
- [ ] Focus halkası tüm interaktif elementlerde görünür
- [ ] Renk kontrastı: focus halkası + arka plan ≥ 3:1 kontrast oranı

### 2.5 Kontrast & Renk
- [ ] Tüm metin/arka plan kombinasyonları WCAG AA (4.5:1) sağlıyor
- [ ] Hedef: WCAG AAA (7:1) büyük metinler hariç tüm metinler
- [ ] Büyük metin (18px+ veya 14px bold): min 3:1 kontrast
- [ ] UI bileşen sınırları (input, buton kenarı): min 3:1
- [ ] Sadece renkle bilgi iletilmiyor (ikon veya metin eşliğinde)
- [ ] Hata durumu kırmızı + ikon + metin ile gösteriliyor
- [ ] Link metni altı çizili veya başka görsel ayırt edici

### 2.6 Görseller & Medya
- [ ] Tüm `<img>` etiketlerinde `alt` attribute zorunlu
- [ ] Dekoratif görseller: `alt=""` (boş)
- [ ] İçerik görselleri: açıklayıcı Türkçe alt metin
- [ ] Kompleks görseller (grafik, harita): `aria-describedby` ile uzun açıklama
- [ ] Logo için alt: `"Kırşehir Görme Engelliler Derneği Logosu"`
- [ ] Arka plan görselleri CSS `background-image` ile (alt gerekmez)
- [ ] Video varsa: altyazı (CC) zorunlu
- [ ] Video varsa: ses dökümü metni
- [ ] Video otomatik oynatma yok (autoplay yasak)
- [ ] Yanıp sönen içerik yok (3 Hz altında kalınmalı — epilepsi riski)

### 2.7 Form Erişilebilirliği (İletişim Formu)
- [ ] Her input için ayrı `<label>` elementi
- [ ] `for` / `id` eşleşmesi doğru
- [ ] `placeholder` tek başına label yerine kullanılmıyor
- [ ] Zorunlu alanlar `required` + `aria-required="true"`
- [ ] Hata mesajları `aria-live="assertive"` ile duyuruluyor
- [ ] Başarı mesajı `aria-live="polite"` ile duyuruluyor
- [ ] Gönder butonu yüklenirken `aria-busy="true"` ataması
- [ ] Captcha varsa erişilebilir alternatif sağlanıyor

### 2.8 Erişilebilirlik Araç Çubuğu (Toolbar)
- [ ] Araç çubuğu tasarımı — sağ alt köşe sabit konumlu
- [ ] Font büyütme butonu (+A):
  - [ ] 100% → 125% → 150% → 175% → 200% adımları
  - [ ] localStorage ile tercih kaydetme
  - [ ] `document.documentElement.style.fontSize` manipülasyonu
- [ ] Yüksek kontrast modu butonu:
  - [ ] Siyah arka plan + sarı metin teması
  - [ ] CSS class toggle ile (`body.high-contrast`)
  - [ ] localStorage ile tercih kaydetme
- [ ] Siyah-Beyaz (gri ton) modu:
  - [ ] `filter: grayscale(100%)` body'ye uygulama
  - [ ] localStorage ile tercih kaydetme
- [ ] Disleksi dostu font modu:
  - [ ] OpenDyslexic font yükleme (Google Fonts / self-hosted)
  - [ ] Tüm metinlere uygulama
  - [ ] localStorage ile tercih kaydetme
- [ ] Dark Mode butonu (sistem tercihini override)
- [ ] Ayarları sıfırla butonu
- [ ] Araç çubuğu kendisi klavye erişilebilir
- [ ] Araç çubuğu açma/kapama butonu ekran okuyucu etiketli

---

## 🎬 FAZA 3 — AÇILIŞ ANİMASYONU (LOADER)

### 3.1 Loader HTML Yapısı
- [ ] `<div id="loader" aria-hidden="true" role="presentation">` wrapper
- [ ] İçinde dernek adı `<span>` elementi (animasyon hedefi)
- [ ] Spinner / progress bar elementi
- [ ] Loader ekran okuyucudan tamamen gizli
- [ ] Loader `<body>` içinde ilk element olarak yerleştirilmiş

### 3.2 Loader CSS
- [ ] `position: fixed; inset: 0; z-index: 9999`
- [ ] Arka plan rengi marka ile uyumlu (koyu tema önerilir)
- [ ] `display: flex; align-items: center; justify-content: center`
- [ ] İlk durum: `opacity: 1; visibility: visible`
- [ ] Kapanış transition: `opacity 0.5s ease, visibility 0.5s`
- [ ] Spinner CSS `@keyframes spin` tanımı (360° dönüş)
- [ ] Metin `@keyframes fadeInUp` tanımı
- [ ] Yazı animasyonu: `opacity: 0 → 1`, `translateY(15px → 0)`

### 3.3 Loader JavaScript
- [ ] `prefers-reduced-motion` kontrolü — azaltılmış harekette animasyon atla
- [ ] `window.addEventListener('load', ...)` ile tetikleme
- [ ] Minimum 800ms — maksimum 1500ms bekleme süresi
- [ ] Loader kapanışı: `opacity = 0; visibility = 'hidden'`
- [ ] `transitionend` sonrası `display: none` ve DOM'dan remove
- [ ] Hata durumunda (load event gelmezse) — 3 saniye fallback timeout
- [ ] Animasyon bitişi ile ana içeriğin `opacity: 0 → 1` geçişi

### 3.4 Loader Erişilebilirlik Kontrol Listesi
- [ ] Loader `aria-hidden="true"` doğrulandı
- [ ] Loader kapandıktan sonra ekran okuyucu `main` elementine odaklanır
- [ ] Tab order loader kapalıyken `main-content`'ten başlıyor
- [ ] `prefers-reduced-motion: reduce` durumunda loader anında kapanıyor
- [ ] Loader kapandıktan sonra DOM'dan kaldırılıyor (performans)

---

## 🎨 FAZA 4 — UI / UX TASARIM SİSTEMİ

### 4.1 Tipografi
- [ ] Başlık fontu seçimi ve Google Fonts / self-hosted yükleme
- [ ] Body fontu seçimi (okunabilirlik öncelikli)
- [ ] Minimum font size: `16px` body
- [ ] Type scale tanımı:
  - [ ] `--text-xs`: 12px
  - [ ] `--text-sm`: 14px
  - [ ] `--text-base`: 16px
  - [ ] `--text-lg`: 18px
  - [ ] `--text-xl`: 20px
  - [ ] `--text-2xl`: 24px
  - [ ] `--text-3xl`: 30px
  - [ ] `--text-4xl`: 36px
  - [ ] `--text-5xl`: 48px
- [ ] Line-height: body `1.6`, başlıklar `1.2`
- [ ] Letter-spacing: başlıklar `-0.02em`, body `0`
- [ ] Font weight değerleri: 400 (regular), 500 (medium), 700 (bold)
- [ ] Türkçe karakter desteği doğrulama (ğ, ü, ş, ı, ö, ç)

### 4.2 Renk Sistemi
- [ ] Ana renk paleti (primary, secondary, accent) WCAG AAA uyumlu
- [ ] Semantik renkler: success, warning, error, info
- [ ] Surface renkler: background, surface, overlay
- [ ] Dark mode renk paleti (tüm renkler için)
- [ ] Yüksek kontrast tema renk paleti
- [ ] Tüm kombinasyonlar contrast checker ile doğrulama
- [ ] CSS değişkenleri olarak tanımlanmış

### 4.3 Spacing & Layout
- [ ] 8px grid sistemi (4, 8, 16, 24, 32, 48, 64, 96, 128px)
- [ ] Max-width container: `1200px`
- [ ] Container padding: mobil `16px`, tablet `24px`, masaüstü `32px`
- [ ] Section vertical padding: `64px` masaüstü, `40px` mobil
- [ ] Gutter (sütun boşluğu): `24px`
- [ ] Column grid: 12 kolon masaüstü, 4 kolon mobil

### 4.4 Bileşen Tasarımı
- [ ] **Buton:** Primary, Secondary, Ghost, Danger varyantları
  - [ ] Hover, Active, Focus, Disabled durumları
  - [ ] Min dokunma alanı: 44x44px (WCAG 2.5.8)
  - [ ] İkon + metin kombinasyonu
  - [ ] Loading state (spinner ile)
- [ ] **Link:** İç link, dış link (ikon ile), tel: link, mailto: link
- [ ] **Kart:** Haber/duyuru kartı bileşeni
- [ ] **Badge / Tag:** Kategori etiketi
- [ ] **Alert:** Başarı, hata, uyarı, bilgi mesajları
- [ ] **Divider:** Bölüm ayıracı
- [ ] **Icon:** SVG ikon sistemi (sprite veya inline)

---

## 📄 FAZA 5 — SAYFA İÇERİKLERİ

### 5.1 Ana Sayfa (index.html)

#### Hero Bölümü
- [ ] `<h1>` — Dernek adı + kısa slogan
- [ ] Altbaşlık (lead paragraph)
- [ ] Primary CTA butonu: "Bize Ulaşın"
- [ ] Secondary CTA butonu: "Hakkımızda"
- [ ] Hero görseli veya illüstrasyon (alt text ile)
- [ ] Responsive: mobilde metin üstte görsel altta

#### Misyon Bölümü
- [ ] `<h2>` — "Amacımız" veya "Misyonumuz"
- [ ] 3 sütunlu özellik kartları (ikon + başlık + kısa metin)
- [ ] İkonlar SVG ve `aria-hidden="true"`

#### Hızlı Erişim Butonları
- [ ] Telefon butonu — `tel:05416484570`
- [ ] E-posta butonu — `mailto:gormeengellilerdernegi@hotmail.com`
- [ ] Konum butonu — Google Maps yeni sekmede açar
- [ ] WhatsApp butonu (varsa)
- [ ] Her buton tıklanabilir alan min 44px

#### İletişim Özeti Bölümü (Ana Sayfa Alt Kısmı)
- [ ] Telefon numarası — tıklanabilir
- [ ] E-posta adresi — tıklanabilir
- [ ] Adres — kısa gösterim

### 5.2 Hakkımızda Sayfası

- [ ] `<h1>` — "Hakkımızda"
- [ ] Dernek tanıtım paragrafları (placeholder metin)
- [ ] Kuruluş yılı ve tarihçe
- [ ] Amaç ve faaliyetler listesi
- [ ] Yönetim kurulu bölümü (opsiyonel — isimler geldiğinde)
- [ ] Fotoğraf galerisi bölümü (opsiyonel)
- [ ] Breadcrumb navigasyon (Ana Sayfa > Hakkımızda)

### 5.3 Tüzük Sayfası

- [ ] `<h1>` — "Dernek Tüzüğü"
- [ ] Tüzük mevcut PDF ise:
  - [ ] PDF dosya boyutu optimize (< 2MB)
  - [ ] İndir butonu (dosya adı Türkçe açıklayıcı)
  - [ ] Erişilebilir PDF embed (iframe değil, link tercih)
  - [ ] "PDF görüntüleyici gerektirmez — indirip açabilirsiniz" notu
- [ ] Tüzük HTML ise:
  - [ ] Madde başlıkları `<h2>`, alt maddeler `<h3>`
  - [ ] Madde numaraları `<ol>` ile
  - [ ] İçindekiler tablosu (sayfada gezinme linkleri)
  - [ ] Her bölüme `id` attribute (ankor linkler)
- [ ] "Geri" linki / breadcrumb
- [ ] Son güncelleme tarihi `<time>` ile

### 5.4 İletişim Sayfası

- [ ] `<h1>` — "İletişim"
- [ ] İletişim bilgileri bloğu:
  - [ ] Telefon: `<a href="tel:05416484570">0541 648 45 70</a>`
  - [ ] Telefon yanında ikon (`aria-hidden`)
  - [ ] E-posta: `<a href="mailto:gormeengellilerdernegi@hotmail.com">...</a>`
  - [ ] E-posta yanında ikon
  - [ ] Adres `<address>` etiketi içinde
  - [ ] Adres yanında ikon
  - [ ] WhatsApp linki (varsa): `https://wa.me/905416484570`
- [ ] Google Maps embed:
  - [ ] `<iframe>` doğru enlem/boylam ile
  - [ ] `title="Kırşehir Görme Engelliler Derneği Konumu"` attribute
  - [ ] Harita yüklenmezse fallback metni
  - [ ] Harita responsive container (aspect-ratio: 16/9)
  - [ ] Harita yüklenmeden önce placeholder (lazy load)
- [ ] "Yol Tarifi Al" butonu — Google Maps yön URL'si ile
- [ ] İletişim formu (opsiyonel):
  - [ ] Ad Soyad alanı
  - [ ] E-posta alanı
  - [ ] Mesaj alanı (textarea)
  - [ ] Gönder butonu
  - [ ] Form validation (HTML5 + JS)
  - [ ] Anti-spam (honeypot alanı)
  - [ ] Başarı / hata mesajı

---

## 🧭 FAZA 6 — NAVİGASYON & GLOBAL BİLEŞENLER

### 6.1 Header / Navbar
- [ ] `<header>` elementi
- [ ] `<nav aria-label="Ana menü">` içinde
- [ ] Logo / site adı — anasayfaya link
- [ ] Menü öğeleri: Ana Sayfa, Hakkımızda, Tüzük, İletişim
- [ ] Aktif sayfa `aria-current="page"` ile işaretli
- [ ] Mobil hamburger menü butonu:
  - [ ] `aria-expanded="false/true"` dinamik
  - [ ] `aria-controls="mobile-menu"` bağlantısı
  - [ ] Metin etiket (ikon yanında görünmez span veya aria-label)
- [ ] Mobil menü açıkken scroll kilidi (`body overflow: hidden`)
- [ ] Mobil menü Escape ile kapanıyor
- [ ] Header sticky (scroll'da sabit) mi değil mi kararı
- [ ] Sticky ise arka plan `backdrop-filter: blur` veya opak
- [ ] Header yüksekliği değişince `scroll-padding-top` güncelleme

### 6.2 Footer
- [ ] `<footer>` elementi
- [ ] Dernek adı ve kısa açıklama
- [ ] Hızlı linkler listesi (nav içinde)
- [ ] İletişim bilgileri özeti
- [ ] Sosyal medya ikonları (varsa) — `aria-label` her birine
- [ ] Telif hakkı notu ve yıl (dinamik `new Date().getFullYear()`)
- [ ] "Sayfanın başına dön" butonu
- [ ] Erişilebilirlik bildirimi linki (opsiyonel)

### 6.3 Breadcrumb
- [ ] `<nav aria-label="Sayfa konumu">` wrapper
- [ ] Schema.org BreadcrumbList JSON-LD
- [ ] `aria-current="page"` son öğeye
- [ ] Mobilde görünürlük (tek satır kalmalı)

---

## 🌍 FAZA 7 — SEO & PERFORMANS

### 7.1 On-Page SEO (Her Sayfa)
- [ ] `<title>` — format: `Sayfa Adı | Kırşehir Görme Engelliler Derneği`
- [ ] `<meta name="description">` — 140-160 karakter, keyword içerikli
- [ ] `<meta name="keywords">` (opsiyonel, düşük etki)
- [ ] `<link rel="canonical">` — her sayfada kendi URL'si
- [ ] `<html lang="tr">` doğru dil tanımı
- [ ] Heading hiyerarşisi H1→H2→H3 doğru
- [ ] H1 per sayfa: sadece bir adet
- [ ] Dahili linkler anlamlı anchor text ile
- [ ] Dış linkler `rel="noopener noreferrer"`

### 7.2 Open Graph & Social Meta
- [ ] `og:title`
- [ ] `og:description`
- [ ] `og:image` (1200x630px, optimize edilmiş)
- [ ] `og:url`
- [ ] `og:type` — `website`
- [ ] `og:locale` — `tr_TR`
- [ ] `og:site_name`
- [ ] Twitter Card meta etiketleri:
  - [ ] `twitter:card` — `summary_large_image`
  - [ ] `twitter:title`
  - [ ] `twitter:description`
  - [ ] `twitter:image`

### 7.3 Yapılandırılmış Veri (Schema.org JSON-LD)
- [ ] `Organization` şeması:
  - [ ] `name`
  - [ ] `url`
  - [ ] `logo`
  - [ ] `contactPoint` (telefon, e-posta)
  - [ ] `sameAs` (sosyal medya linkleri)
- [ ] `LocalBusiness` şeması:
  - [ ] `name`
  - [ ] `address` (PostalAddress)
  - [ ] `telephone`
  - [ ] `email`
  - [ ] `geo` (GeoCoordinates — enlem, boylam)
  - [ ] `openingHours` (varsa)
- [ ] `BreadcrumbList` şeması (iç sayfalar)
- [ ] `WebPage` şeması (her sayfa)
- [ ] Schema doğrulama: Google Rich Results Test

### 7.4 Teknik SEO Dosyaları
- [ ] `sitemap.xml` oluşturma:
  - [ ] Tüm sayfa URL'leri
  - [ ] `lastmod` tarihleri
  - [ ] `changefreq` değerleri
  - [ ] `priority` değerleri
- [ ] `robots.txt` oluşturma:
  - [ ] `User-agent: *`
  - [ ] `Allow: /`
  - [ ] Sitemap URL'si ekleme
- [ ] `404.html` özel hata sayfası:
  - [ ] Kullanıcı dostu mesaj
  - [ ] Ana sayfaya dön linki
  - [ ] Navigasyon erişimi
- [ ] `humans.txt` (opsiyonel)

### 7.5 Performans (Lighthouse >90 Hedef)
- [ ] Tüm görseller WebP formatına dönüştürülmüş
- [ ] Görseller doğru boyutlandırılmış (responsive srcset)
- [ ] `loading="lazy"` — viewport dışı görsellere
- [ ] `loading="eager"` — hero / LCP görseline
- [ ] `width` ve `height` attribute — tüm img etiketlerine (CLS önleme)
- [ ] CSS dosyası minify
- [ ] JavaScript dosyası minify ve defer / async
- [ ] Kritik CSS inline (above-the-fold)
- [ ] Font `display: swap` kullanımı
- [ ] Font subset (sadece Latin + Turkish karakterler)
- [ ] Google Maps iframe — kullanıcı etkileşimiyle yüklenme (click to load)
- [ ] Preload kritik fontlar: `<link rel="preload" as="font">`
- [ ] Preconnect CDN / font kaynakları: `<link rel="preconnect">`
- [ ] Gereksiz JavaScript kaldırıldı
- [ ] Third-party script'ler defer edildi

### 7.6 Local SEO
- [ ] Google Business Profile kaydı açma
- [ ] İşletme adı doğrulama: "Kırşehir Görme Engelliler Derneği"
- [ ] Adres girişi ve pin doğrulama (harita üzerinde)
- [ ] Telefon numarası girişi
- [ ] Kategori: "Sivil Toplum Kuruluşu" / "Engelli Derneği"
- [ ] Çalışma saatleri girişi
- [ ] Web sitesi URL'si girişi
- [ ] Fotoğraf yükleme (dernek binası, etkinlik)
- [ ] NAP tutarlılığı: site içindeki adres/tel Google Business ile aynı

---

## 🌙 FAZA 8 — DARK MODE & TEMA YÖNETİMİ

- [ ] `prefers-color-scheme: dark` otomatik algılama
- [ ] CSS değişkenleri dark tema için tanımlı
- [ ] Manuel dark/light toggle butonu (toolbar içinde)
- [ ] Toggle tercihi localStorage'a kaydedilir
- [ ] Sayfa yenilenmede tercih hatırlanır
- [ ] Dark modda tüm görseller uyumlu (`mix-blend-mode` veya opacity)
- [ ] Dark modda kontrast oranları yeniden doğrulanmış
- [ ] Dark modda focus halleri görünür
- [ ] Transition: `transition: background-color 0.3s, color 0.3s`
- [ ] System preference değişince otomatik güncelleme

---

## 📱 FAZA 9 — MOBİL UYUMLULUK

- [ ] Tüm layout'lar 320px'de çalışıyor (en küçük ekran)
- [ ] Touch hedefleri min 44x44px (WCAG 2.5.8)
- [ ] Touch hedefleri arasında min 8px boşluk
- [ ] Yatay scroll yok (overflow-x: hidden)
- [ ] Metin 400% zoom'da yatay scroll yok (WCAG 1.4.10)
- [ ] Pinch-to-zoom engellenmemiş (user-scalable=no yok)
- [ ] Hamburger menü doğru çalışıyor
- [ ] Form inputları mobilde zoom yapmıyor (font-size: 16px)
- [ ] Google Maps harita mobilde kaydırılabilir
- [ ] Telefon numarası mobilde tıklanabilir (tel: link)
- [ ] iOS Safe Area desteği (env(safe-area-inset-*))
- [ ] Android Chrome address bar rengi: `theme-color` meta

---

## 🔒 FAZA 10 — GÜVENLİK

- [ ] HTTPS zorunlu yönlendirme (HTTP → HTTPS)
- [ ] HSTS header (`Strict-Transport-Security`)
- [ ] Content Security Policy (CSP) header
- [ ] `X-Content-Type-Options: nosniff` header
- [ ] `X-Frame-Options: DENY` header
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` header
- [ ] Form varsa CSRF koruması
- [ ] Honeypot anti-spam alanı (form)
- [ ] E-posta adresi obfuscation (bot scraping önleme)
- [ ] Harici linkler `rel="noopener noreferrer"`
- [ ] Dosya yükleme yoksa file input yok

---

## 🧪 FAZA 11 — TEST

### 11.1 Fonksiyonel Testler
- [ ] Tüm dahili linkler çalışıyor
- [ ] Tüm harici linkler doğru hedefte açılıyor
- [ ] Tel: linki mobil cihazda çalışıyor
- [ ] Mailto: linki mail uygulamasını açıyor
- [ ] WhatsApp linki doğru numara ile açılıyor
- [ ] Google Maps yol tarifi doğru konumu gösteriyor
- [ ] Dark mode toggle çalışıyor ve kaydediliyor
- [ ] Font büyütme toolbar çalışıyor
- [ ] Yüksek kontrast mod çalışıyor
- [ ] Loader doğru sürede kapanıyor
- [ ] 404 sayfası doğru gösteriyor

### 11.2 Tarayıcı Uyumluluk Testleri
- [ ] Chrome (son 2 sürüm) — Windows
- [ ] Firefox (son 2 sürüm) — Windows
- [ ] Safari (son 2 sürüm) — macOS
- [ ] Edge (son 2 sürüm) — Windows
- [ ] Chrome — Android
- [ ] Safari — iOS (iPhone 12+)
- [ ] Samsung Internet — Android

### 11.3 Erişilebilirlik Testleri
- [ ] **axe DevTools** tarayıcı eklentisi testi (sıfır kritik hata)
- [ ] **WAVE** (WebAIM) erişilebilirlik tarayıcı testi
- [ ] **Lighthouse** Accessibility skoru ≥ 95
- [ ] **Keyboard-only** gezinme testi (mouse kullanmadan):
  - [ ] Tab ile tüm interaktif elementlere ulaşılıyor
  - [ ] Enter/Space ile butonlar/linkler çalışıyor
  - [ ] Escape ile modal/dropdown kapanıyor
  - [ ] Focus hiçbir yerde kaybolmuyor
- [ ] **NVDA** ekran okuyucu testi (Windows + Chrome):
  - [ ] Sayfa başlığı okunuyor
  - [ ] Heading navigasyonu çalışıyor (H tuşu)
  - [ ] Landmark navigasyonu çalışıyor (D tuşu)
  - [ ] Link listesi doğru (K tuşu)
  - [ ] Loader duyurulmuyor
  - [ ] Buton durumları okunuyor
- [ ] **VoiceOver** testi (iOS Safari) — opsiyonel
- [ ] Kontrast oranı: **Colour Contrast Analyser** ile tüm kombinasyonlar
- [ ] **WCAG 2.1 AA** tam uyum doğrulaması
- [ ] **WCAG 2.1 AAA** uyum doğrulaması (mümkün olan kriterler)

### 11.4 Performans Testleri
- [ ] **Google Lighthouse** — tüm kategoriler ≥ 90:
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 95
  - [ ] Best Practices ≥ 90
  - [ ] SEO ≥ 95
- [ ] **PageSpeed Insights** (mobil + masaüstü)
- [ ] **WebPageTest** — ilk yükleme süresi
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID / INP (Interaction to Next Paint) < 200ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 800ms
- [ ] Toplam sayfa ağırlığı hedef: < 500KB (gzip sonrası)

### 11.5 SEO Testleri
- [ ] **Google Search Console** URL İnceleme aracı
- [ ] **Rich Results Test** — Schema doğrulama
- [ ] Sitemap Google Search Console'a gönderildi
- [ ] Robots.txt doğru çalışıyor
- [ ] Canonical URL'ler doğru
- [ ] Mobil uyumluluk testi (Google)
- [ ] Core Web Vitals raporu yeşil

---

## 🚀 FAZA 12 — DEPLOY & YAYIN

- [ ] Production build oluşturma
- [ ] Build çıktısı yerel test
- [ ] Staging ortamına deploy (canlı öncesi test)
- [ ] Staging'de tam erişilebilirlik testi
- [ ] Staging'de tam SEO kontrolü
- [ ] Production hosting'e deploy
- [ ] Domain DNS bağlama
- [ ] SSL sertifikası aktif ve yeşil kilit görünüyor
- [ ] HTTPS yönlendirmesi çalışıyor
- [ ] CDN aktif ve tüm asset'ler CDN'den geliyor
- [ ] Sitemap Google Search Console'a gönderildi
- [ ] Google Analytics / Search Console kurulumu (opsiyonel)
- [ ] Uptime monitoring kurulumu (UptimeRobot — ücretsiz)
- [ ] Canlı sitede son erişilebilirlik kontrolü

---

## 📦 FAZA 13 — TESLİM & DOKÜMANTASYON

- [ ] Site canlıya alındı ve çalışıyor
- [ ] Domain erişim bilgileri teslimi
- [ ] Hosting erişim bilgileri teslimi
- [ ] Google Business Profile erişimi teslimi
- [ ] Kullanım kılavuzu hazırlanması:
  - [ ] İçerik nasıl güncellenir
  - [ ] Fotoğraf nasıl eklenir
  - [ ] İletişim bilgisi nasıl değiştirilir
- [ ] Basit README.md (teknik kişi için)
- [ ] Erişilebilirlik beyanı sayfası yayınlanması (opsiyonel)

---

## 🎁 BONUS — DEĞER ARTIRAN ÖZELLİKLER (İkinci Faz)

- [ ] Duyuru / Haber bölümü (statik JSON ile)
- [ ] Basit admin paneli (içerik güncelleme)
- [ ] Bağış butonu entegrasyonu (iyilik.io veya banka havale bilgisi)
- [ ] WhatsApp Business butonu (canlı destek görünümü)
- [ ] Etkinlik takvimi (opsiyonel)
- [ ] Fotoğraf galerisi (lightbox ile)
- [ ] Dil seçeneği (Türkçe — ileride İngilizce)
- [ ] Print CSS (sayfayı yazdırma için)
- [ ] Service Worker (offline erişim — PWA)
- [ ] Push notification (duyurular için — opsiyonel)

---

## 📊 BAŞARI KRİTERLERİ

| Kriter | Hedef |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| WCAG Uyumluluk | 2.1 AA (AAA hedef) |
| LCP | < 2.5 saniye |
| CLS | < 0.1 |
| Sayfa Ağırlığı | < 500 KB |
| Kontrast Oranı | ≥ 7:1 (AAA) |
| Dokunma Hedef Boyutu | ≥ 44x44 px |
| Loader Süresi | ≤ 1.5 saniye |

---

> 🤖 **Hatırlatma:** Tüm kodlama AI tarafından üretilecektir.
> Bu TODO listesi; hangi özelliğin, hangi standartta, hangi sırayla üretileceğini belirler.
> Her madde tamamlandığında `[x]` ile işaretlenir.
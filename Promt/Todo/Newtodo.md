# KGED Web Sitesi — Kapsamlı Geliştirme & Bug Fix Listesi

> **Kırşehir Görme Engelliler Derneği** · Kod tabanı analizi sonucu üretilmiştir  
> Toplam: **30 madde** · Kritik Bug: 7 · Erişilebilirlik: 8 · Özellik: 10 · Performans: 5

---

## 🔴 KRİTİK BUG FİXLER

### 1. Galeri sayfası HTML'i eksik kapanıyor — syntax hatası
**Dosya:** `src/build/site-renderer.js` → `renderGalleryContent()`

`renderGalleryContent` fonksiyonu `<div>` ve `</section>` kapanış taglarını **return etmiyor**. Galeri `<section>` bloğu yarım bırakıldığında tarayıcı hata telafi mekanizmasıyla kapatıyor, ancak bu Lighthouse/validator hatası verir ve bazı tarayıcılarda CSS bozukluğu yaratır.

```js
// Mevcut — fonksiyon yarım bitiyor:
return `${galleryStyles}
  <section class="page-header" ...>
  ...
  <section class="section" ...>
    <div class="container">
      ...
      <div class="gallery-page-grid" id="gallery-page-grid" aria-live="polite">
         <script type="module">   // ← script açılıyor ama section kapatılmıyor!

// Düzeltme: return string'inin sonuna ekle:
      </div>   <!-- gallery-page-grid -->
    </div>   <!-- container -->
  </section>
</div>   <!-- lightbox -->
`;
```

Ayrıca **lightbox HTML'i** hiç render edilmiyor! `window.openLightbox` fonksiyonu `gallery-lightbox` id'li bir elementi bekliyor ama bu element `renderGalleryContent` içinde **oluşturulmamış**. Lightbox açınca JS hatası alınır.

**Düzeltme:** `renderGalleryContent` return string'ine ekle:
```html
<div id="gallery-lightbox" class="gallery-lightbox" tabindex="-1" role="dialog" aria-modal="true" aria-label="Görsel büyütücü">
  <button class="gallery-lightbox-close" onclick="window.closeLightbox()" aria-label="Kapat">×</button>
  <img id="lightbox-img" src="" alt="" />
  <p id="lightbox-caption" class="gallery-lightbox-caption"></p>
</div>
```

---

### 2. Admin paneli şifresi açık kaynak kodda — güvenlik açığı
**Dosya:** `admin/index.html`

```js
const ADMIN_PASS_HASH = hashString('kged2026');  // ← şifre plaintext olarak kaynak kodda!
```

Kullanılan `hashString` fonksiyonu gerçek bir hash değil, basit bir **bit-shift CRC** operasyonu. Chrome DevTools ile 3 saniyede kırılır.

**Düzeltme seçenekleri (öncelik sırasıyla):**
- Admin panelini Vercel'in `password protection` özelliğiyle (Pro plan) koruyun
- Ya da şifreyi kaynak koddan tamamen çıkarıp environment variable + serverless function'a taşıyın
- En azından şifreyi `.env` dosyasına alıp Vite build-time injection yapın (client-side olmaya devam eder ama daha az bariz)

---

### 3. `connect-src 'self'` CSP direktifi Google Fonts & Maps'i engelliyor
**Dosya:** `vercel.json`

```json
"connect-src 'self'"
```

- Galeri sayfasında `admin/index.html`'den `/src/data/site-content.json` fetch ediliyor → `connect-src 'self'` ile çalışır ✓  
- Ama Google Maps iFrame JS'i `maps.googleapis.com`'a bağlanmaya çalışır → **CSP violation → harita tamamen çalışmaz**
- `@vercel/speed-insights` paketi telemetri endpoint'lerine bağlanır → **bloklanır**

**Düzeltme:**
```json
"connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com"
```

---

### 4. `galeri/index.html` dosyası mevcut ama `vite.config.js`'de route tanımlı — ancak `renderGalleryContent` eksik lightbox'la deploy edilirse prod'da çöker
**Dosya:** `src/build/site-renderer.js`

`renderGalleryContent` içindeki `<script type="module">` bloğu **inline script** olarak render ediliyor. `vercel.json`'daki CSP şu:

```
script-src 'self' 'unsafe-inline'
```

`'unsafe-inline'` var, bu yüzden inline script çalışır — ancak **type="module" olan inline script**'ler bazı tarayıcılarda farklı davranır ve Content Security Policy'nin `'strict-dynamic'` ile olan uyumunu tamamen bozar. Uzun vadede `nonce` tabanlı CSP'ye geçilmeli.

---

### 5. Footer'daki `back-to-top` butonu ile component'taki `#back-to-top` çakışıyor
**Dosya:** `src/build/site-renderer.js`

Footer'da `id="back-to-top-footer"` olan bir link var. `nav.js`'teki `initBackToTop()` ise `#back-to-top` id'li `<button>`'u arıyor. Bunlar farklı elementler ve ikisi aynı anda sayfada bulunuyor. Footer linki `scroll` davranışını tetiklemez; kullanıcı her ikisinin de görünmesini bekler. Ama `#back-to-top` button'u `visible` class'ıyla gösterilirken footer linki her zaman görünür — **tutarsız UX**.

**Düzeltme:** Footer'daki `back-to-top-footer` linkini kaldırın veya `initBackToTop()` ile senkronize edin.

---

### 6. `initBackToTop()` içinde `document.querySelector('.skip-link')?.focus()` erişilebilirlik sorunu
**Dosya:** `src/scripts/nav.js`

Başa dön butonuna basıldığında `.skip-link` elementine focus atılıyor. Skip link görünmez (`top: -100%`) bir elementtir. Screen reader kullanıcıları fokusun nerede olduğunu anlayamaz; NVDA/JAWS bunu boş alan olarak okuyabilir.

**Düzeltme:**
```js
btn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const main = document.getElementById('main-content');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }
});
```

---

### 7. `site.webmanifest` ve `favicon.svg` public dizininde yok
**Dosya:** `src/build/site-renderer.js` head render'ı

```html
<link rel="manifest" href="/site.webmanifest" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

Bu dosyalar `public/` dizininde olması gerekiyor ama kod tabanında tanımlanmamış. 404 alınır, PWA özelliği hiç çalışmaz.

**Düzeltme:** `public/site.webmanifest` ve `public/favicon.svg` dosyalarını oluşturun.

```json
// public/site.webmanifest
{
  "name": "Kırşehir Görme Engelliler Derneği",
  "short_name": "KGED",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#4F46E5",
  "icons": [{ "src": "/Logo.png", "sizes": "192x192", "type": "image/png" }]
}
```

---

## 🟠 ERİŞİLEBİLİRLİK (A11Y) GELİŞTİRMELERİ

### 8. `<main>` elementi `tabindex="-1"` ile kalıcı olarak işaretleniyor
**Dosya:** `src/scripts/loader.js`

`moveFocusToMain()` fonksiyonu her çağrıldığında `tabindex="-1"` ekliyor ve blur sonrası kaldırıyor. Ama `dismissLoader`'ın iki kod yolu var (transitionend + setTimeout fallback) — her ikisi de `moveFocusToMain()`'i çağırabilir. Double-call olursa `blur` event'i iki kez bağlanır.

**Düzeltme:**
```js
let focusMoved = false;
function moveFocusToMain() {
  if (focusMoved) return;
  focusMoved = true;
  // ... mevcut kod
}
```

---

### 9. Hero section `aria-labelledby` referans ettiği `id` yanlış
**Dosya:** `src/build/site-renderer.js`

```html
<section class="hero" aria-labelledby="hero-heading">
  ...
  <h1 class="hero__title" id="hero-heading">
```

Bu doğru ✓ — ama aynı sayfada birden fazla section `aria-labelledby` kullanıyor ve bazılarında `id` yok:

```html
<section class="section section--alt" aria-labelledby="contact-summary-heading">
  ...
  <h2 class="section__title" id="contact-summary-heading">  ← bu var ✓
```

Ancak son CTA section'ı (`quicklinks`) `aria-labelledby="quicklinks-heading"` referansı veriyor ama render edilen `renderSectionHeader` helper'ı `id` **eklemez** — sadece text render eder. Screen reader bu section başlığını okuyamaz.

**Düzeltme:** `renderSectionHeader`'a opsiyonel `id` parametresi ekleyin.

---

### 10. Galeri görselleri için `alt` text dinamik hesaplanmıyor
**Dosya:** `src/build/site-renderer.js` → `renderGalleryContent` inline script

```js
imgHtml = '<img ... alt="' + cap + '" ...>';
```

`cap` boşsa `alt=""` — bu dekoratif görsel için doğru ama galeri görselleri bilgilendirici. Eğer caption yoksa kategori + tarih kombinasyonundan otomatik `alt` üretilmeli:

```js
const altText = cap || `${label} görseli, ${new Date(item.createdAt).toLocaleDateString('tr-TR')}`;
```

---

### 11. Mobil menü `aria-modal` attribute'u eksik
**Dosya:** `src/build/site-renderer.js` → `renderMobileNav()`

Mobil menü açıldığında `role="dialog"` ve `aria-modal="true"` olmalı ki screen reader'lar arkadaki içeriği okuma girişiminde bulunmasın.

```html
<nav class="nav--mobile" id="mobile-nav" 
     role="dialog" 
     aria-modal="true"
     aria-label="Mobil menü">
```

---

### 12. Toolbar panel focus trap yok
**Dosya:** `src/scripts/toolbar.js`

Toolbar açıldığında Escape ile kapanıyor ✓ — ama **Tab** tuşuyla panel dışına çıkılabiliyor. WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap) gerekli; ama açık bir modal/panel'de focus'un panel içinde kalması da beklenir. Panel içindeki son butondan Tab'a basıldığında focus toggle butonuna dönmeli.

**Düzeltme:** `focusTrap` utility oluşturun veya `inert` attribute kullanın.

---

### 13. `lang` attribute dinamik olmak yerine hardcode `tr` — çok dilli destek yok ama en azından sayfa bazlı olmalı
**Dosya:** Tüm HTML dosyaları

```html
<html lang="tr" data-theme="light">
```

`data-theme="light"` JavaScript çalışmadan önce flash yaratıyor — ancak `renderThemeBootstrap()` bunu engelliyor ✓. Sorun şu: `data-theme` inline olarak HTML'de set ediliyor ama JS daha hızlı overwrite ediyor. Bu ince bir FOUC (Flash of Unstyled Content) yaratır özellikle slow connection'larda. `data-theme="light"` yerine `data-theme` attribute'u hiç set etmeyip tamamen JS'e bırakmak daha sağlıklı.

---

### 14. İletişim sayfasında `<address>` elementi hatalı kullanılıyor
**Dosya:** `src/build/site-renderer.js` → `renderContactContent()`

`<address>` HTML elementi **sadece yakındaki içeriğin iletişim bilgisi** için kullanılmalı. Dernek adresi için `<address>` yerine `<p>` ve schema.org markup kullanılmalı; ya da `<address>` bir `<article>` içine wrap edilmeli.

---

### 15. Yüksek kontrast modunda logo görseli karanlık arka plana karışıyor
**Dosya:** `src/styles/tokens.css`

`[data-theme="high-contrast"]` tanımında `--color-bg: #000000` var. Logo `/Logo.png` görselinin transparan arka planı varsa siyah zemin üzerinde görünmeyebilir.

**Düzeltme:**
```css
[data-theme="high-contrast"] .header__logo-image {
  filter: invert(1);
}
```

---

## 🟡 YENİ ÖZELLİKLER

### 16. İletişim formu ekleyin (Formspree/Web3Forms ile — backend gerektirmez)
**Dosya:** Yeni bölüm → `renderContactContent()`

Şu an sadece telefon ve mail linki var. Basit bir HTML formu + `https://formspree.io` entegrasyonu ile backend'siz çalışan iletişim formu:

```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
  <input type="text" name="name" placeholder="Adınız" required />
  <input type="email" name="email" placeholder="E-posta" required />
  <textarea name="message" placeholder="Mesajınız" required></textarea>
  <button type="submit">Gönder</button>
</form>
```

Ücretsiz plan: ayda 50 form gönderimi. KGED için yeterli.

---

### 17. Sosyal medya paylaşım butonları
**Dosya:** `src/data/site-content.json` → `contact.social` alanları hepsi `null`

Sosyal medya hesapları yoksa footer'daki `sameAsMarkup` hiç render edilmiyor. Bunun yerine "Bizi takip edin" bölümü yerine **"Bu sayfayı paylaşın"** butonları eklenebilir (Twitter/X, WhatsApp, Facebook).

```js
// site-renderer.js — renderFooter() içine ekle:
const shareUrl = encodeURIComponent(content.site.url);
const shareText = encodeURIComponent(content.site.description);
```

---

### 18. Sayfa yazdırma stili iyileştirmesi — tüzük sayfası için kritik
**Dosya:** `src/styles/components.css` → `@media print`

Mevcut print stili sadece belirli elementleri gizliyor. Tüzük sayfasında kullanıcı PDF'i yazdırmak isteyebilir. Şunlar eklenmeli:
- `@page { margin: 2cm; }`
- Dernek adı ve logo header'da yazdırılsın
- URL'ler link metninin yanında görünsün: `a::after { content: " (" attr(href) ")"; }`

---

### 19. Cookie/localStorage consent banner (KVKK uyumu)
**Dosya:** Yeni bileşen gerekiyor

Site localStorage kullanıyor (tema, font boyutu, toolbar tercih, admin session). Türkiye KVKK kapsamında kullanıcıdan izin alınmalı ya da bu verilerin "teknik zorunluluk" kapsamında olduğu belirtilmeli. Basit bir banner yeterli:

```html
<div id="kvkk-banner" role="alert">
  Bu site yerel depolama (localStorage) kullanmaktadır. 
  <a href="/tuzuk">Detaylar</a>
  <button onclick="acceptKvkk()">Anladım</button>
</div>
```

---

### 20. `prefers-reduced-motion` hero animasyonlarına uygulanmıyor
**Dosya:** `src/styles/layout.css`

`reset.css`'de global `prefers-reduced-motion` desteği var ✓:
```css
animation-duration: 0.01ms !important;
```

Ama hero elementleri `animation` kullanıyor:
```css
.hero__icon-bg { animation: heroGlow 3s infinite; }
.hero__icon-ring { animation: heroRingSpin 20s linear infinite; }
```

`reset.css`'deki override bu animasyonları durdurur — ama `loader.js` içinde `prefersReduced` kontrolü var ve loader hemen dismiss ediliyor ✓. Ancak hero animasyonları için ayrı `@media (prefers-reduced-motion: reduce)` bloğu eklenmeli:

```css
@media (prefers-reduced-motion: reduce) {
  .hero__icon-bg,
  .hero__icon-ring,
  .loader__eye-ring,
  .loader__eye-dot { animation: none; }
}
```

---

### 21. `robots.txt` dosyası eksik
**Dosya:** `public/` dizini

Admin sayfasının `noindex, nofollow` meta tag'i var ama `robots.txt` yoksa Google botları `/admin/` dizinini yine de keşfedip URL olarak saklayabilir.

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://kirshehirgormeengelliler.org.tr/sitemap.xml
```

---

### 22. `sitemap.xml` otomatik üretimi
**Dosya:** `vite.config.js`

Build sırasında otomatik sitemap üretecek bir Vite plugin eklenebilir:

```js
// vite.config.js içine:
function sitemapPlugin() {
  return {
    name: 'sitemap',
    closeBundle() {
      const urls = ['/', '/hakkimizda', '/galeri', '/tuzuk', '/iletisim'];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>https://kirshehirgormeengelliler.org.tr${u}</loc></url>`).join('\n')}
</urlset>`;
      fs.writeFileSync('dist/sitemap.xml', xml);
    }
  };
}
```

---

### 23. Galeri filtrelemesi URL hash ile senkronize olmalı
**Dosya:** Galeri inline script

Kullanıcı galeriyi filtreler, sayfayı yeniler → filtre sıfırlanır. Hash ile state tutulabilir:

```js
// Filtre değişince:
history.replaceState(null, '', '#' + cat);

// Sayfa yüklenince:
const initialFilter = location.hash.slice(1) || 'all';
filterGallery(allBtn, initialFilter);
```

---

### 24. Tüzük sayfasında PDF görüntüleyici mobilde `<object>` çalışmıyor
**Dosya:** `src/build/site-renderer.js` → `renderConstitutionContent()`

```html
<object data="..." type="application/pdf" width="100%" height="600">
```

iOS Safari ve birçok Android tarayıcısı `<object>` ile PDF render etmez. Fallback olarak `<iframe>` veya Google Docs viewer kullanılmalı:

```html
<iframe 
  src="https://docs.google.com/viewer?url=ENCODED_PDF_URL&embedded=true"
  width="100%" height="600">
</iframe>
```

Veya önce `<object>`, sonra `<embed>`, son olarak indir linki fallback chain'i.

---

### 25. Derneğin kuruluş kutlaması için dinamik sayaç widget'ı
**Dosya:** Ana sayfa

Kuruluş tarihi: 5 Şubat 2026. "X gündür faaliyetteyiz" gibi basit bir sayaç, sayfaya canlılık katar:

```js
const founded = new Date('2026-02-05');
const days = Math.floor((Date.now() - founded) / 86400000);
document.getElementById('days-active').textContent = days;
```

---

## 🟢 PERFORMANS İYİLEŞTİRMELERİ

### 26. Google Fonts `display=swap` eksik, CLS yaratıyor
**Dosya:** `src/styles/tokens.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
```

`display=swap` zaten var ✓ — ama `font-display: swap` Vite build'inde extract edilip bundle'a eklenmez. Daha iyi yol: fontları `public/fonts/` dizinine self-host edin. Google Fonts GDPR açısından da risklidir (KVKK kapsamında).

**Düzeltme:** `fontsource` npm paketi veya manuel woff2 self-hosting.

---

### 27. `firebase` paketi import ediliyor ama hiçbir yerde kullanılmıyor
**Dosya:** `package.json`

```json
"dependencies": {
  "firebase": "^12.11.0"  // ← kullanılmıyor!
}
```

Firebase bundle boyutu ~500KB. Hiçbir JS dosyasında `import ... from 'firebase'` yok. Bu paket sadece `node_modules`'da yer kaplıyor olabilir ama eğer bir yerde yanlışlıkla import edilirse build boyutunu patlatar.

**Düzeltme:**
```bash
npm uninstall firebase
```

---

### 28. Hero section görselinin `loading="eager"` ve LCP optimizasyonu
**Dosya:** `src/build/site-renderer.js`

Logo görseli:
```html
<img src="/Logo.png" ... aria-hidden="true" />
```

`loading` attribute'u yok → default `eager`. LCP için logo'nun `fetchpriority="high"` ve `preload` link tag'i ile önceden yüklenmesi gerekiyor:

```html
<!-- Head'e ekle: -->
<link rel="preload" as="image" href="/Logo.png" fetchpriority="high" />
```

---

### 29. CSS `color-mix()` Safari < 16.2'de çalışmıyor
**Dosya:** `src/styles/layout.css`

```css
.hero {
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-primary-950) 95%, transparent) 0%,
    ...
  );
}
```

`color-mix()` CSS fonksiyonu 2023'te yaygınlaştı. Safari 16.1 ve öncesinde, bazı Android Chrome versiyonlarında çalışmaz ve hero arka planı tamamen beyaz/boş kalır.

**Düzeltme:** Fallback ekleyin:
```css
.hero {
  background: linear-gradient(135deg, #1E1B4B, #1a0a3d);  /* fallback */
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-primary-950) 95%, transparent) 0%,
    ...
  );
}
```

---

### 30. `@vercel/speed-insights` paketi entegre edilmemiş
**Dosya:** `package.json` ve `src/scripts/main.js`

```json
"@vercel/speed-insights": "^2.0.0"  // yüklü ama kullanılmıyor
```

`main.js` içinde import yok. Ya kaldırın ya da entegre edin:

```js
// main.js içine:
import { inject } from '@vercel/speed-insights';
inject();
```

---

## 📋 ÖZET TABLOSU

| # | Kategori | Öncelik | Efor | Etki |
|---|---------|---------|------|------|
| 1 | Bug | 🔴 Kritik | Küçük | Galeri çöküyor |
| 2 | Güvenlik | 🔴 Kritik | Orta | Admin erişim riski |
| 3 | Bug | 🔴 Kritik | Küçük | Harita çalışmıyor |
| 4 | Bug | 🔴 Kritik | Küçük | CSP/inline script |
| 5 | Bug | 🔴 Kritik | Küçük | Çift buton çakışması |
| 6 | A11y | 🔴 Kritik | Küçük | Screen reader sorunu |
| 7 | Bug | 🔴 Kritik | Küçük | 404 manifest/favicon |
| 8 | A11y | 🟠 Önemli | Küçük | Focus yönetimi |
| 9 | A11y | 🟠 Önemli | Küçük | Section başlıkları |
| 10 | A11y | 🟠 Önemli | Küçük | Galeri alt text |
| 11 | A11y | 🟠 Önemli | Küçük | Mobil menü ARIA |
| 12 | A11y | 🟠 Önemli | Orta | Toolbar focus trap |
| 13 | A11y | 🟡 Normal | Küçük | FOUC iyileştirme |
| 14 | A11y | 🟡 Normal | Küçük | address elementi |
| 15 | A11y | 🟡 Normal | Küçük | HC logo görünürlük |
| 16 | Özellik | 🟠 Önemli | Orta | İletişim formu |
| 17 | Özellik | 🟡 Normal | Küçük | Paylaşım butonları |
| 18 | Özellik | 🟡 Normal | Küçük | Print stilleri |
| 19 | Hukuki | 🟠 Önemli | Küçük | KVKK banner |
| 20 | A11y | 🟠 Önemli | Küçük | Reduced motion hero |
| 21 | SEO | 🟠 Önemli | Küçük | robots.txt |
| 22 | SEO | 🟡 Normal | Orta | sitemap.xml |
| 23 | UX | 🟡 Normal | Küçük | Galeri URL hash |
| 24 | Bug | 🟠 Önemli | Küçük | PDF mobil fallback |
| 25 | Özellik | 🟢 Nice | Küçük | Kuruluş sayacı |
| 26 | Performans | 🟠 Önemli | Orta | Font self-hosting |
| 27 | Performans | 🔴 Kritik | Küçük | Firebase kaldır |
| 28 | Performans | 🟡 Normal | Küçük | LCP preload |
| 29 | Bug | 🟠 Önemli | Küçük | color-mix() fallback |
| 30 | Performans | 🟡 Normal | Küçük | Speed insights |

---

## 🚀 ÖNERİLEN UYGULAMA SIRASI

**Sprint 1 — Hemen (1-2 saat):**
1, 3, 5, 6, 7, 21, 27, 29 → Bug fix + hızlı kazanımlar

**Sprint 2 — Bu hafta (2-4 saat):**
2, 11, 12, 20, 24, 28, 30 → Güvenlik + erişilebilirlik

**Sprint 3 — Bu ay (4-8 saat):**
16, 19, 22, 26 → Yeni özellikler + SEO

**Uzun vade:**
17, 18, 23, 25 → Nice-to-have özellikler

---

*Oluşturulma: Nisan 2026 · Kaynak: KGED codebase analizi*


Erişilebilirlik (A11y) - Derneğin hedef kitlesi için kritik
[ ] TODO 1: Ekran Okuyucu (Screen Reader) Optimizasyonu: aria-label'lar güzel eklenmiş ancak form, buton ve galerideki eksik okumalar için NVDA veya JAWS ile baştan sona test yap. Özellike "Mobil Menü" açılıp kapanırken odak (focus) yönetimini kontrol et.

[ ] TODO 2: Klavye Navigasyonu (Focus Visible): Görme engelli/az gören kullanıcılar için :focus-visible CSS seçicisi kullanılarak sekme (Tab) ile gezinirken odaklanılan öğelerin etrafına çok belirgin, yüksek kontrastlı bir outline (çerçeve) ekle.

[ ] TODO 3: Galeri Görselleri için Zorunlu Alt Metin (Alt Text): site-renderer.js içinde renderGalleryPage fonksiyonunda, cap (caption) boşsa "Görsel" varsayılanı atanmış. Görme engelliler için bu anlamsızdır. JSON verisinde görsel açıklaması (alt text) girmeyi zorunlu kılacak bir mekanizma kur veya daha açıklayıcı fallback'ler yaz.

[ ] TODO 4: "İçeriğe Atla" (Skip Link) Kontrolü: renderSkipLink() eklenmiş ancak bu linkin sadece klavye ile odaklanıldığında görünür olduğundan (CSS ile position: absolute; left: -9999px vb. taktiklerle gizlenip :focus ile ekrana geldiğinden) emin ol.

🛡️ Güvenlik ve Hata Yönetimi (Code Quality & Bug Fixes)
[ ] TODO 5: JSON Okuma Hata Yönetimi (Error Handling): readSiteContent() fonksiyonunda fs.readFileSync kullanılmış ama try...catch bloğu yok. site-content.json bozulur veya silinirse tüm site çöker. Güvenli bir hata yakalama mekanizması ekle.

[ ] TODO 6: XSS (Cross-Site Scripting) Açığı Kapatma: Galeriyi render eden <script type="module"> içindeki string birleştirmelerde (örneğin: alt="' + cap + '") tek veya çift tırnak içeren bir cap verisi HTML'i bozabilir veya zararlı script çalıştırabilir. Değişkenleri JavaScript içinde doğrudan DOM elementleri (örn: document.createElement) oluşturarak eklemek çok daha güvenlidir.

[ ] TODO 7: Eksik Dosya Yolları İçin Null Check: toAbsoluteUrl fonksiyonunda siteUrl'nin undefined veya null gelme ihtimaline karşı başa bir kontrol ekle.

[ ] TODO 8: Dinamik Yıl Kontrolü: <span id="footer-year"></span> olarak bırakılan telif hakkı yılı için, istemci tarafında (client-side) bu ID'yi bulup mevcut yılı yazdıran JavaScript kodunun çalıştığından (veya Node.js tarafında render edilirken statik olarak basıldığından) emin ol.

🚀 Performans ve SEO
[ ] TODO 9: Resim Optimizasyonu (WebP/AVIF): Sitedeki tüm görselleri (site.logoPath, galeri vs.) WebP veya AVIF formatına çevir. Görsel yükleme hızları düşük internet bağlantılarında (özellikle mobilde) çok önemlidir.

[ ] TODO 10: Preload ve Prefetch Kullanımı: Kritik CSS dosyalarını, markanın fontlarını ve Tüzük PDF'i gibi ağır dosyaları tarayıcıya önceden bildirmek için <link rel="preload"> etiketleri ekle.

[ ] TODO 11: Kod Küçültme (Minification): site-renderer.js'den çıkan HTML devasa bir string. Üretime (Production) çıkarken bu HTML'i minifiye edecek (boşlukları silecek) bir kütüphane (örn: html-minifier) entegre et.

[ ] TODO 12: CSS & JS Ayrıştırma: Özellikle Galeri sayfası için inline yazılmış olan <style> ve <script type="module"> bloklarını harici dosyalara al. Bu, tarayıcının dosyaları önbelleğe (cache) almasını sağlar ve kodun okunabilirliğini artırır.

📱 Kullanıcı Deneyimi (UI/UX) ve Geliştirmeler
[ ] TODO 13: Galeri Lightbox Mobil Kaydırma (Swipe): Galeride resim büyütüldüğünde (lightbox açıkken), mobil kullanıcıların sağa-sola kaydırarak (swipe) diğer resimlere geçmesini sağlayan bir touch event (dokunma algılayıcı) ekle. Ekrandaki X butonuna basmak mobilde zor olabilir.

[ ] TODO 14: PDF Mobil Fallback: Tüzük sayfasında <object> ile PDF gösteriliyor. Birçok mobil tarayıcı <object> içindeki PDF'leri doğrudan render edemez, gri bir ekran gösterir. Mobil ekranlar için (Media Query kullanarak) "PDF'i görüntülemek için cihazınıza indirin" yazan net bir uyarı ve buton tasarımına geç.

[ ] TODO 15: KVKK & Çerez Politikası Onayı: Sitede Google Maps iframe'i ve WhatsApp butonu var. KVKK (Kişisel Verilerin Korunması Kanunu) gereği kullanıcı siteye girdiğinde ufak, göze batmayan bir çerez/gizlilik onay çubuğu (cookie banner) ekle.

[ ] TODO 16: Harita (Google Maps) Tembel Yükleme ve Gizlilik: Google Maps iframe'ini varsayılan olarak yüklemek yerine, bir kapak görseli koyup "Haritayı Yükle" butonuna tıklandığında iframe'i DOM'a ekle. Bu hem site açılışını saniyelerce hızlandırır hem de kullanıcı verisi gizliliğini (GDPR/KVKK) korur.

[ ] TODO 17: Z-Index Çakışmaları Kontrolü: WhatsApp floating butonu ile "Başa Dön" (Back to Top) butonunun mobil cihazlarda üst üste binmediğinden veya footer linklerini kapatmadığından emin olmak için yerleşimlerini CSS ile ayarla.

[ ] TODO 18: Aktif Menü Vurgusu: Gezinme menüsünde (Navigasyon) hangi sayfadaysak o linkin sadece aria-current="page" alması yetmez; görsel olarak da (örneğin altında kalın bir çizgi veya farklı renk ile) "Şu an bu sayfadasınız" mesajını net vermesi gerekir.

[ ] TODO 19: Form Gönderim Simülasyonu: Eğer iletişim sayfasında gerçekten çalışan bir form yapmayacaksan (sadece mailto/telefon linkleri varsa), "İletişim Formu" başlığını "Hızlı İletişim" gibi daha doğru bir terimle değiştir. Kullanıcılar bir form doldurmayı bekleyip bulamazsa hüsrana uğrayabilir.

[ ] TODO 20: Tema Değişiminde FOUC (Flash of Unstyled Content) Engelleme: Karanlık mod (Dark mode) açılışta script üzerinden localStorage'dan okunarak atanıyor. Bunun HTML render edilmeden hemen önce (head içinde ve senkronize olarak) çalıştığından emin ol ki site önce beyaz açılıp sonra karanlık moda "pat" diye geçmesin.
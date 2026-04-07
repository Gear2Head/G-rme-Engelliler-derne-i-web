# KGED Web Sitesi — Nihai TODO Listesi

Bu liste, hem önceki geliştirmeleri hem de yeni yapılan audit sonuçlarını kapsamaktadır.

## ✅ TAMAMLANANLAR (Sprint 1)

- [x] **Firebase Temizliği**: Projeden Firebase tamamen kaldırıldı, offline mod aktif edildi.
- [x] **Bug Fix**: Galeri sayfası HTML kapanış hataları ve lightbox sorunları giderildi.
- [x] **Bug Fix**: CSP `connect-src` Google Maps engeli düzeltildi.
- [x] **A11y**: Loader için `prefers-reduced-motion` desteği ve focus yönetimi eklendi.
- [x] **A11y**: Mobil menü için `aria-modal` ve focus trap iyileştirmesi yapıldı.
- [x] **A11y**: Başa Dön butonunun skip-link yerine main-content'e odaklanması sağlandı.
- [x] **Perf**: Google Maps'in tıkla-yükle (lazy load) yöntemiyle gizlilik ve performans artırıldı.
- [x] **Hukuk**: KVKK/Çerez onay banner'ı eklendi.

## 🔴 KRİTİK & GÜVENLİK (Öncelikli)

- [ ] **Admin Şifre Güvenliği**: Mevcut CRC tabanlı hash yerine daha güvenli bir yöntem.
- [ ] **Galeri Veri Optimizasyonu**: Base64 resimlerin JSON boyutunu şişirmemesi için Cloudinary vb. kullanımı değerlendirilmeli.
- [ ] **Toolbar Focus Trap**: Erişilebilirlik panelinde Tab tuşu ile dışarı çıkılması engellenmeli.

## 🟠 İÇERİK & ERİŞİLEBİLİRLİK

- [ ] **Aktif Sayfa Vurgusu**: Navigasyon menüsünde aktif sayfanın görsel olarak belirtilmesi.
- [ ] **Galeri Alt Metinleri**: Caption olmayan resimler için otomatik anlamlı description üretimi.
- [ ] **Tüzük PDF Mobil**: Mobil cihazlar için direkt indirme butonunun her zaman görünür olması.

## 🟡 SEO & PERFORMANS

- [ ] **WebP Dönüşümü**: Tüm galeri resimlerinin WebP olarak saklanması.
- [ ] **Sitemap Auto-Gen**: Build sırasında `sitemap.xml` dosyasının otomatik oluşturulması.
- [ ] **SEO Meta Tags**: Open Graph görsellerinin her sayfa için özelleştirilmesi.

## 🟢 İLERİ SEVİYE ÖZELLİKLER

- [ ] **İletişim Formu**: Formspree entegrasyonu ile çalışan bir form.
- [ ] **Yönetim Kurulu Resimleri**: Liste yerine görsel destekli kart yapısı.
- [ ] **Kuruluş Sayacı**: "X gündür faaliyetteyiz" widget'ı.

---

*Son Güncelleme: 7 Nisan 2026*



# KGED Web Sitesi — Kapsamlı Geliştirme Listesi

> **AI Kullanım Notu:** Her madde `[DOSYA:SATIR]` referansı içerir. Düzenleme yaparken önce o dosya/satırı oku, sonra minimal diff uygula. Bu format token israfını önler.

---

## 🔴 KRİTİK BUG FİXLER

### TODO 01 — Galeri Çift `#gallery-lightbox` ID Bug
**Dosya:** `src/build/site-renderer.js` **Satır: ~870–900** (`renderGalleryContent` fonksiyonu)
**Sorun:** `renderGalleryContent` içinde `<div id="gallery-lightbox">` HTML'e **iki kez** ekleniyor (hem `<script>` öncesi hem de `<script>` sonrası). Bu `getElementById` ile yanlış elementin yakalanmasına yol açar.
**Fix:** `src/build/site-renderer.js` satır ~900'deki ikinci `<div id="gallery-lightbox"...>` bloğunu tamamen sil. Sadece script öncesindeki tek örnek kalsın.

---

### TODO 02 — `setActiveNavLink` Yanlış Aktif Eşleşmesi
**Dosya:** `src/scripts/nav.js` **Satır: 35–42**
**Sorun:** `currentPath.startsWith(href)` kontrolü `/h` ile başlayan her path'i `/hakkimizda` linkini aktif yapar. Örneğin `/hizmetler` gibi hipotetik bir sayfa açılınca Hakkımızda linki de aktif olur.
**Fix:** Satır 39'u şu şekilde güncelle:
```js
const isActive = href === '/'
  ? currentPath === '/'
  : currentPath === href || currentPath.startsWith(href + '/');
```

---

### TODO 03 — `dismissLoader` Çift `moveFocusToMain` Çağrısı
**Dosya:** `src/scripts/loader.js` **Satır: 37–47**
**Sorun:** `transitionend` event'i ile `setTimeout(700ms)` fallback aynı anda tetiklenebilir; `moveFocusToMain._called` guard var ama `loader.remove()` iki kez çağrılıyor.
**Fix:** Satır 43'teki `if (loader.parentNode)` bloğunu şu şekilde güncelle:
```js
setTimeout(() => {
  if (loader.isConnected) { loader.remove(); moveFocusToMain(); }
}, 700);
```

---

### TODO 04 — Admin Panel `hashString` Güvenliksiz Hash
**Dosya:** `admin/index.html` **Satır: ~207–215**
**Sorun:** Basit djb2 hash client-side JavaScript'te görünür. `ADMIN_PASS_HASH` ve `hashString` fonksiyonu DevTools'da anında görülebilir.
**Fix:** Bkz. TODO 20 (Firebase Auth) — şifre doğrulamayı tamamen Firebase'e taşı. Geçici fix olarak admin klasörüne Vercel `x-robots-tag: noindex` header'ı ekle. `vercel.json` içine:
```json
{ "source": "/admin/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }
```

---

### TODO 05 — `package.json` ve `package-lock.json` Uyumsuzluğu
**Dosya:** `package.json` **Satır: 10–12**
**Sorun:** `package.json` → `dependencies`'de `firebase` yok, ama `package-lock.json` firebase@12.11.0 içeriyor. Bu `npm ci` ile deployment'ta hata üretir.
**Fix:** `package.json` `dependencies` objesine ekle:
```json
"firebase": "^12.11.0"
```

---

### TODO 06 — CSP'de Firebase Domain'leri Eksik
**Dosya:** `vercel.json` **Satır: 16** (`Content-Security-Policy` değeri)
**Sorun:** Firebase Firestore/Storage kullanan admin paneli için CSP'de `firestore.googleapis.com`, `storage.googleapis.com`, `*.firebaseapp.com` eksik. Firebase çağrıları bloklanır.
**Fix:** `connect-src` direktifine şunları ekle:
```
https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firebasestorage.googleapis.com
```

---

### TODO 07 — Footer `back-to-top-footer` Butonu Çalışmıyor
**Dosya:** `src/build/site-renderer.js` **Satır: ~645** (`renderFooter`)
**Sorun:** Footer'daki "Başa Dön" linki `href="#main-content"` ile anchor link, ama `src/scripts/nav.js`'deki `initBackToTop` sadece `#back-to-top` ID'li butonu dinliyor.
**Fix:** `src/scripts/nav.js` `initBackToTop` fonksiyonuna şunu ekle:
```js
document.getElementById('back-to-top-footer')
  ?.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
```

---

## 🔥 ADMİN PANELİ — FİREBASE ENTEGRASYONU

### TODO 08 — Firebase Config Dosyası Oluştur
**Yeni Dosya:** `src/firebase/config.js`
**İçerik:** Firebase project config (apiKey, authDomain, storageBucket vb.). Değişkenler Vite env (`import.meta.env.VITE_*`) ile Vercel environment variables'dan okunmalı. `.env.local` dosyası `.gitignore`'a eklenmeli.
**Bağlı dosya:** `.gitignore` — `*.env*` satırı kontrolü.

---

### TODO 09 — Firebase Admin Auth (Email/Password)
**Dosya:** `admin/index.html` — client-side hash auth tamamen kaldırılacak.
**Yeni Dosya:** `src/firebase/auth.js`
**İçerik:** `signInWithEmailAndPassword`, `onAuthStateChanged`, `signOut` sarmalayan modül. Admin paneli login formu bu modülü kullanacak. Firebase Console'dan 1 kullanıcı (admin@kged.tr) manuel oluşturulacak.

---

### TODO 10 — Firestore Galeri Koleksiyonu
**Yeni Dosya:** `src/firebase/gallery.js`
**İçerik:** `addDoc`, `getDocs`, `deleteDoc`, `onSnapshot` ile `gallery_items` koleksiyonu CRUD. `onSnapshot` ile admin panelindeki galeri listesi anlık senkron olur.
**Admin panel etkisi:** `admin/index.html` satır ~330 (handleImageAdd) — base64 yerine Firestore doc + Storage URL kullanılacak.

---

### TODO 11 — Firebase Storage Görsel Yükleme
**Yeni Dosya:** `src/firebase/storage.js`
**İçerik:** `uploadBytes`, `getDownloadURL` ile görsel yükleme. Görseller `gallery/{timestamp}_{filename}` path'iyle Storage'a yüklenecek. Client-side canvas resize (800px, 0.7 quality) korunacak.
**Bağlı:** TODO 10 — Firestore doc'u Storage URL'i içerecek.

---

### TODO 12 — Galeri Sayfası Firestore'dan Çeksin
**Dosya:** `src/build/site-renderer.js` **Satır: ~770** (`renderGalleryContent` içindeki `<script>` bloğu)
**Sorun:** Şu an galeri items statik JSON'dan okunuyor — admin panelinden eklenen görseller siteye yansımıyor.
**Fix:** Gallery `<script>` bloğunu güncelle: sayfa açılışında `getDocs('gallery_items')` çağır, `onSnapshot` ile canlı güncelle. Firebase SDK script tag ile CDN'den yüklenecek (`type="module"` + `import`).

---

### TODO 13 — Firestore Site İçerik Düzenleme
**Yeni Koleksiyon:** `site_config` → doc: `content`
**Admin panel etkisi:** Hakkımızda, iletişim bilgileri değişiklikleri artık `site-content.json` indirmek yerine Firestore'a yazılacak.
**Galeri sayfası:** Sayfalar bu koleksiyonu okuyarak dinamik içerik gösterecek (sadece galeri için — statik sayfalar SEO için build-time render'ı koruyacak).

---

### TODO 14 — Admin Panel: Görsel Silme
**Dosya:** `admin/index.html` — galeri listesi render fonksiyonu
**İçerik:** Her galeri kartına çöp kutusu ikonu ekle. Tıklandığında `deleteDoc(Firestore)` + `deleteObject(Storage)` çağır. Silmeden önce `confirm()` sorusu sor.

---

### TODO 15 — Admin Panel: Sürükle-Bırak Sıralama
**Dosya:** `admin/index.html`
**İçerik:** HTML5 Drag & Drop API ile galeri görsellerinin sırasını değiştir. Her doc'a `order: number` alanı ekle. `dragstart`, `dragover`, `drop` event'leri ile sıra güncellenir, Firestore'a `updateDoc` ile yazılır.

---

### TODO 16 — Admin Panel: Toplu Yükleme (Çoklu Dosya)
**Dosya:** `admin/index.html` **Satır: ~335** (`<input type="file"...>`)
**Fix:** `multiple` attribute ekle. Upload handler'ı `Promise.all` ile paralel yükleme yapacak şekilde güncelle. Progress bar göster.

---

### TODO 17 — Admin Panel: Yönetim Kurulu Editörü
**Dosya:** `admin/index.html`
**İçerik:** `site_config/content` Firestore doc'una `boardMembers` array'i ekle. Admin panelde dinamik liste: isim + görev girişi, sıra değiştirme, silme. Hakkımızda sayfası bu array'i Firestore'dan okuyacak.

---

## 📱 MOBİL ENTEGRASYON

### TODO 18 — PWA Manifest ve Service Worker
**Yeni Dosya:** `public/sw.js`
**Mevcut Dosya:** `public/site.webmanifest` — `start_url`, `display: standalone`, `theme_color`, ikon dizisi (`192x192`, `512x512`) ekle.
**`src/scripts/main.js` satır 7 sonrasına** ekle:
```js
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js');
}
```
**`sw.js` içeriği:** Cache-first strateji — CSS/JS/fontlar önbelleklenir. Offline sayfası (`/offline.html`) ekle.

---

### TODO 19 — Viewport Meta Genişletme + Safe Area
**Dosya:** `src/build/site-renderer.js` **Satır: ~700** (`renderHead` fonksiyonu, viewport meta)
**Fix:** Viewport meta'yı güncelle:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
**`src/styles/layout.css`** — header ve footer'a `padding-inline: max(var(--space-4), env(safe-area-inset-left))` ekle. iPhone notch/Dynamic Island uyumu.

---

### TODO 20 — Touch Event İyileştirmeleri
**Dosya:** `src/styles/components.css` **Satır: 1** (dosya başına ekle)
**İçerik:**
```css
@media (hover: none) and (pointer: coarse) {
  .btn:hover { transform: none; }
  .card:hover { transform: none; box-shadow: var(--shadow-sm); }
}
```
Dokunmatik ekranlarda hover animasyonları kaldır — mobil'de takılı kalan hover state'leri önler.

---

### TODO 21 — Mobile Nav Swipe-to-Close
**Dosya:** `src/scripts/nav.js` **Satır: 15** (`initMobileMenu` fonksiyonu sonuna)
**İçerik:** Touch swipe right → menü kapat:
```js
let touchStartX = 0;
mobileNav.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
mobileNav.addEventListener('touchend', e => {
  if (e.changedTouches[0].clientX - touchStartX > 60) closeMenu();
});
```

---

### TODO 22 — Galeri Lightbox Swipe Desteği
**Dosya:** `src/build/site-renderer.js` **Satır: ~840** (lightbox `<script>` bloğu)
**İçerik:** `touchstart` / `touchend` ile soldan sağa swipe → önceki görsel, sağdan sola → sonraki görsel. `currentIndex` takibi gerekir.

---

### TODO 23 — Bottom Sheet Navigation (Mobil)
**Dosya:** `src/styles/layout.css` — `.nav--mobile` kuralları (~Satır 185)
**İçerik:** Mobilde menü yukarıdan açılmak yerine ekranın altından yukarı kayan "bottom sheet" olarak aç. `transform: translateY(100%)` → `translateY(0)` geçişi. `border-radius: 1.5rem 1.5rem 0 0` üst köşelere ekle.

---

### TODO 24 — Sticky Mobile CTA Butonu
**Dosya:** `src/styles/layout.css` — dosya sonuna ekle
**İçerik:** Mobil cihazlarda ekranın altında sabit "Bizi Ara" butonu:
```css
.mobile-cta-bar {
  display: none;
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--color-primary-600); color: #fff;
  padding: 1rem; text-align: center; z-index: 900;
}
@media (max-width: 767px) { .mobile-cta-bar { display: flex; } }
```
`src/build/site-renderer.js` `renderBody` fonksiyonuna bu HTML'i ekle.

---

### TODO 25 — vCard Üretimi (Rehbere Ekle)
**Dosya:** `src/build/site-renderer.js` **Satır: ~585** (`renderContactContent`)
**İçerik:** İletişim bilgileri kartlarının altına bir buton ekle. Tıklandığında JS ile `.vcf` dosyası oluşturup indir:
```js
const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nADR:${address}\nEND:VCARD`;
```
Blob ile `URL.createObjectURL` — `download="kged-iletisim.vcf"`.

---

### TODO 26 — Web Share API (Galeri Paylaşım)
**Dosya:** `src/build/site-renderer.js` **Satır: ~830** (galeri `<script>`)
**İçerik:** Lightbox içine paylaş butonu ekle:
```js
if (navigator.share) {
  await navigator.share({ title: caption, url: window.location.href });
} else {
  // Fallback: clipboard copy
  navigator.clipboard.writeText(window.location.href);
}
```

---

### TODO 27 — `prefers-reduced-motion` JavaScript Kontrolü
**Dosya:** `src/scripts/main.js` **Satır: 7 sonrasına** ekle:
```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reduced-motion');
}
```
**`src/styles/layout.css`** içindeki `@media (prefers-reduced-motion: reduce)` bloğunu bu class selector ile güçlendir.

---

### TODO 28 — `prefers-contrast: more` OS Senkronizasyonu
**Dosya:** `src/scripts/toolbar.js` **Satır: `initToolbar` fonksiyonu başına** ekle:
```js
const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
if (prefersHighContrast.matches && !getStoredTheme()) {
  applyTheme('high-contrast');
}
prefersHighContrast.addEventListener('change', e => {
  if (e.matches && !localStorage.getItem(STORAGE_KEY)) applyTheme('high-contrast');
});
```

---

### TODO 29 — `.sr-only` Utility Class
**Dosya:** `src/styles/components.css` **Satır: 1** (dosya başına ekle):
```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
.sr-only-focusable:focus { all: revert; }
```
Kullanım yerleri: hero ikonları, toolbar butonları, sosyal link metinleri.

---

## ⚡ PERFORMANS

### TODO 30 — Galeri Infinite Scroll / Pagination
**Dosya:** `src/build/site-renderer.js` **Satır: ~820** (galeri `<script>` içi `renderGalleryPage`)
**İçerik:** `const PAGE_SIZE = 12;` tanımla. İlk render'da sadece ilk 12 item'ı bas. Listenin altına `IntersectionObserver` gözlemcisi ekle — viewport'a girince sonraki 12'yi yükle. DOM'a `insertAdjacentHTML` ile ekle (full re-render değil).

---

### TODO 31 — Critical CSS Inline (FOUC Tam Önleme)
**Dosya:** `src/build/site-renderer.js` **Satır: ~695** (`renderHead`)
**İçerik:** Mevcut `<style>body{opacity:0}body.ready{opacity:1}</style>` satırını genişlet. Header, loader, hero için minimal kritik CSS inline ekle (`--color-bg`, `--font-heading`, temel layout). Google Fonts gecikmesi sırasında düzen kaymasını önler.

---

### TODO 32 — Resim Lazy Loading + `fetchpriority`
**Dosya:** `src/build/site-renderer.js` **Satır: ~820** (galeri card img render)
**İçerik:** Galeri kartlarındaki `<img>` etiketlerine:
- İlk 3 resme: `loading="eager" fetchpriority="high"`
- Geri kalanına: `loading="lazy" decoding="async"`
LCP (Largest Contentful Paint) skoru iyileşir.

---

### TODO 33 — Google Fonts Self-Host Seçeneği
**Dosya:** `src/styles/tokens.css` **Satır: 8** (`@import url('https://fonts.googleapis.com/...')`)
**İçerik:** Fontları `public/fonts/` klasörüne indir. `@font-face` ile self-host et. `font-display: swap` ekle. `size-adjust` + `ascent-override` ile CLS sıfırla:
```css
@font-face {
  font-family: 'Inter'; src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; size-adjust: 100.3%; ascent-override: 90%;
}
```
Ayrıca `vercel.json`'dan `fonts.googleapis.com` bağlantısı `preconnect` kaldırılabilir.

---

### TODO 34 — Vite Build Optimizasyonu
**Dosya:** `vite.config.js` **Satır: 33** (`build:` objesine ekle):
```js
build: {
  cssCodeSplit: true,
  minify: 'terser',
  terserOptions: { compress: { drop_console: true } },
  rollupOptions: {
    output: {
      manualChunks: { firebase: ['firebase/app', 'firebase/firestore', 'firebase/storage'] }
    }
  }
}
```

---

### TODO 35 — Print CSS QR Kod
**Dosya:** `src/styles/layout.css` — `@media print` bloğu **Satır: ~515** (mevcut print bloğunu genişlet)
**İçerik:** Tüzük ve iletişim sayfaları için sağ üst köşeye QR kod alanı. `qrcode.min.js` CDN'den lazy yüklenecek, sadece print tetiklendiğinde:
```js
window.addEventListener('beforeprint', () => {
  import('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
    .then(() => { new QRCode(el, window.location.href); });
});
```

---

## 🔒 GÜVENLİK

### TODO 36 — Firebase Security Rules
**Yeni Dosya:** `firestore.rules`
**İçerik:** 
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery_items/{doc} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@kged.tr';
    }
    match /site_config/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

### TODO 37 — Storage Security Rules
**Yeni Dosya:** `storage.rules`
**İçerik:** Herkes okuyabilir (galeri görselleri), sadece auth kullanıcı yazabilir. Max 5MB boyut kontrolü:
```
allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
```

---

### TODO 38 — Rate Limiting Admin Login (Firebase)
**Bağlı:** TODO 09
**İçerik:** Firebase Auth zaten brute-force koruması sağlar. Ek olarak `admin/index.html`'deki manuel lockout kodu temizlenecek. Firebase `auth/too-many-requests` error'u yakalanacak ve Türkçe mesaj gösterilecek.

---

### TODO 39 — Subresource Integrity (SRI) CDN Bağlantıları
**Dosya:** `src/build/site-renderer.js` **Satır: ~700** (`renderHead`)
**İçerik:** Harici CDN scriptlerine (QRCode.js vb.) `integrity="sha384-..."` ve `crossorigin="anonymous"` attribute'ları ekle. `openssl dgst -sha384 -binary dosya.js | base64` ile hash hesaplanır.

---

### TODO 40 — `.env` Güvenlik Katmanı
**Yeni Dosya:** `.env.local` (gitignore'da)
**İçerik:**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
```
**Dosya:** `.gitignore` — `.env*` satırı zaten var mı kontrol et. Yoksa ekle.

---

## ♿ ERİŞİLEBİLİRLİK

### TODO 41 — ARIA Live Region Galeri Filtre
**Dosya:** `src/build/site-renderer.js` **Satır: ~785** (`gallery-page-grid` div'i)
**Fix:** `aria-live="polite"` var ama `aria-atomic="false"` ve `aria-label` eksik. Filtre sonucunu duyurmak için:
```html
<p id="gallery-result-count" class="sr-only" aria-live="polite"></p>
```
Her filtre değişiminde: `document.getElementById('gallery-result-count').textContent = `${items.length} görsel gösteriliyor.``;`

---

### TODO 42 — Galeri Keyboard Navigation (Lightbox)
**Dosya:** `src/build/site-renderer.js` **Satır: ~850** (lightbox keydown handler)
**Mevcut:** Sadece `Escape` dinleniyor.
**Fix:** Sol/sağ ok tuşları ile lightbox'ta gezinme ekle:
```js
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'Escape') closeLightbox();
});
```

---

### TODO 43 — Focus Trap (Lightbox ve Mobile Menu)
**Dosya:** `src/scripts/nav.js` — `initMobileMenu` **Satır: 15 sonrası**
**İçerik:** Menü açıkken Tab tuşu menü dışına çıkmasın. Focusable elementler listesi: `a[href], button:not([disabled])`. Son elementin tabı → ilk elemente dön (döngüsel focus trap).

---

### TODO 44 — Color Contrast Audit (WCAG AA)
**Dosya:** `src/styles/tokens.css`
**İnceleme:** `--color-text-muted: #6B7280` beyaz arka planda 4.1:1 kontrast → WCAG AA için minimum 4.5:1 gerekli.
**Fix:** Satır ~33: `--color-text-muted: #4B5563;` (kontrast ~6:1)
Ayrıca `--color-text-faint: #9CA3AF` → sadece dekoratif metin için kullan, bilgi içeren metin için kullanma.

---

## 🔍 SEO ve SOSYAL

### TODO 45 — Structured Data: Organization sameAs Sosyal Linkler
**Dosya:** `src/build/site-renderer.js` **Satır: ~585** (`buildOrganizationSchema`)
**Mevcut:** `sameAs` sadece sosyal linkler doluysa ekleniyor.
**İyileştirme:** Google Haritalar URL'ini de `sameAs`'e ekle. `schema.org/contactPoint` içine `areaServed: "Kırşehir"` ekle.

---

### TODO 46 — Open Graph Resmi Otomatik Üret
**Dosya:** Yeni: `src/build/og-image-generator.js`
**İçerik:** Build sırasında `canvas` (Node.js canvas kütüphanesi) ile her sayfa için 1200x630 OG görseli üret. Dernek adı, sayfa başlığı, logo. `public/og/` klasörüne kaydet.
**`src/build/site-renderer.js` `renderHead`** içinde `og:image` referansını bu dosyalara yönlendir.

---

### TODO 47 — Sitemap.xml Otomatik Üretimi
**Yeni Dosya:** `src/build/generate-sitemap.js`
**İçerik:** Vite `closeBundle` hook'unda `sitemap.xml` üret. Tüm statik sayfalar + son değişiklik tarihi. `public/sitemap.xml`'e yaz.
**`vercel.json`** — `/sitemap.xml` için header: `Cache-Control: public, max-age=86400`.

---

### TODO 48 — robots.txt İyileştirme
**Mevcut Dosya:** `public/robots.txt` (varsa)
**İçerik:**
```
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://kirshehirgormeengelliler.org.tr/sitemap.xml
```

---

## 🎨 UX İYİLEŞTİRMELERI

### TODO 49 — Skeleton Loading Ekranları
**Dosya:** `src/styles/components.css` — dosya sonuna ekle
**İçerik:** Galeri yüklenirken card placeholder'ları:
```css
.skeleton { background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-hover) 50%, var(--color-surface) 75%); background-size: 200% 100%; animation: skeleton-wave 1.5s ease infinite; }
@keyframes skeleton-wave { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
```
Galeri `renderGalleryPage` Firestore'dan yüklenirken 6 skeleton card göster.

---

### TODO 50 — Toast Notification Sistemi
**Yeni Dosya:** `src/scripts/toast.js`
**İçerik:** `showToast(message, type)` — `success | error | info`. DOM'a geçici `<div role="alert">` ekler, 3 saniye sonra kaldırır. Admin panelinde "Kaydedildi ✓" gibi geri bildirimler için kullanılacak.
**`src/scripts/main.js`** içine import et.

---

### TODO 51 — Keyboard Shortcut: Erişilebilirlik Toolbar
**Dosya:** `src/scripts/toolbar.js` **Satır: `initToolbar` sonu**
**İçerik:** `Alt + A` kısayolu ile toolbar aç/kapat:
```js
document.addEventListener('keydown', e => {
  if (e.altKey && e.key === 'a') { panel.classList.toggle('open'); toggle.focus(); }
});
```

---

### TODO 52 — Hata Sayfaları (500, Offline)
**Yeni Dosya:** `public/offline.html`
**İçerik:** Service Worker tarafından servis edilecek basit offline sayfası. Dernek iletişim bilgilerini statik olarak içersin (telefon, adres) — internet olmadan bile erişilebilir.
**`public/500.html`** — Vercel 500 hatası için özel sayfa.

---

### TODO 53 — Smooth Scroll Behavior Polyfill
**Dosya:** `src/scripts/main.js` **Satır: 10 sonrasına**
**İçerik:** Safari <15.4 `scroll-behavior: smooth` desteklemez. Basit polyfill:
```js
if (!('scrollBehavior' in document.documentElement.style)) {
  import('https://cdnjs.cloudflare.com/ajax/libs/smoothscroll/1.4.10/smoothscroll.min.js');
}
```

---

## 🧹 KOD KALİTESİ

### TODO 54 — `site-renderer.js` Modüler Ayrıştırma
**Dosya:** `src/build/site-renderer.js` (~1400 satır)
**Plan:** Fonksiyonları dosyalara böl:
- `src/build/renderers/head.js` → `renderHead`
- `src/build/renderers/layout.js` → `renderHeader`, `renderFooter`, `renderToolbar`
- `src/build/renderers/pages/*.js` → her sayfa için ayrı dosya
- `src/build/icons.js` → `icon()` fonksiyonu
`site-renderer.js` sadece orkestrasyonu yönetir.

---

### TODO 55 — ESLint + Prettier Konfigürasyonu
**Yeni Dosya:** `.eslintrc.json`, `.prettierrc`
**`package.json`** `devDependencies`'e ekle: `eslint`, `@eslint/js`, `prettier`, `eslint-config-prettier`.
**`scripts`'e ekle:** `"lint": "eslint src/**/*.js"`, `"format": "prettier --write src/"`.

---

### TODO 56 — JSDoc Tip Anotasyonları
**Dosya:** `src/scripts/toolbar.js`, `src/scripts/theme.js`, `src/scripts/nav.js`
**İçerik:** Her `export` edilen fonksiyon için `@param`, `@returns` JSDoc ekle. IDE otomatik tamamlama ve hata yakalama için.

---

### TODO 57 — CSS Custom Properties Audit
**Dosya:** `src/styles/tokens.css`
**İçerik:** `--toolbar-width: 56px` tanımlanmış ama kullanılıyor mu kontrol et. Kullanılmayan token'ları temizle. `src/styles/layout.css` içindeki hardcoded değerleri (`56px`, `72px`) token ile değiştir.

---

## 🚀 DEPLOYMENT

### TODO 58 — Vercel Analytics Genişletme
**Dosya:** `src/scripts/main.js` **Satır: 13–15** (mevcut Speed Insights import)
**İçerik:** `@vercel/analytics` paketi de ekle:
```js
import('@vercel/analytics').then(({ inject }) => inject());
```
`package.json`'a `"@vercel/analytics": "^1.0.0"` ekle.

---

### TODO 59 — Preview Deployment Environment Değişkenleri
**Yeni Dosya:** `.env.preview`
**İçerik:** Vercel preview deployment'larında test Firebase projesi kullanmak için ayrı env. `VITE_FIREBASE_PROJECT_ID=kged-preview` gibi. `vercel.json`'a environment scope ekle.

---

### TODO 60 — GitHub Actions CI/CD
**Yeni Dosya:** `.github/workflows/deploy.yml`
**İçerik:** Push on `main` → `npm ci` → `npm run build` → Vercel CLI deploy. PR'larda preview URL otomatik yorum olarak ekle.

---

## 📊 TAMAMLANMA DURUMU

| Kategori | Toplam | Kritik |
|---|---|---|
| Bug Fix | 7 | 3 |
| Admin/Firebase | 10 | 5 |
| Mobil | 11 | 4 |
| Performans | 6 | 2 |
| Güvenlik | 5 | 3 |
| Erişilebilirlik | 5 | 2 |
| SEO | 4 | 1 |
| UX | 5 | 2 |
| Kod Kalitesi | 4 | 1 |
| Deployment | 3 | 1 |
| **Toplam** | **60** | **24** |

---

## 🗓️ Öneri Sıralama

**Sprint 1 (Acil):** TODO 01, 02, 05, 06, 08, 09, 10, 11, 18, 36, 37
**Sprint 2 (Mobil):** TODO 19, 20, 21, 22, 23, 24, 25, 28, 29
**Sprint 3 (Performans):** TODO 30, 31, 32, 34, 49, 50
**Sprint 4 (Kalite):** TODO 45, 47, 48, 54, 55, 58

---

*Son güncelleme: 2026-04-07 | Aktif geliştirme: TODO 42–48 (bkz. orijinal liste)*
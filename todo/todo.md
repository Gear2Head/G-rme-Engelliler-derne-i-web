# KGED Web Sitesi — Master TODO & Bug Listesi

**Son Güncelleme:** 11 Nisan 2026  
**Kapsam:** Tüm bug'lar + yeni özellikler + teknik borç

---

## 🔴 KRİTİK — Hemen Düzeltilmesi Gerekenler

---

### BUG-01 · Duyurular Supabase'e Kaydedilmiyor (Admin Panel)

**Sorun:** Admin panelde duyuru ekleniyor, kaydediliyor görünüyor ama `site-content.json`'da tutuluyor. Vercel'e deploy edildiğinde statik dosya güncellenmediği için canlıda görünmüyor.

**Kök Neden:** `saveSiteConfig()` Supabase'deki `site_config` tablosuna yazıyor. Ancak canlı sitede `src/build/sync-content.js` sadece **build sırasında** çalışıyor. Deploy sonrası admin'den yapılan değişiklikler Supabase'e gidiyor ama sayfa HTML'i statik render edildiği için güncelleme yansımıyor.

**Etkilenen Dosyalar:**
- `src/scripts/hydrate.js` — `initHydration()` fonksiyonu announcements'ı hydrate etmiyor
- `src/build/site-renderer.js` — `renderAnnouncementsContent()` statik `content.announcements` kullanıyor
- `src/supabase/site_config.js` — `getSiteConfig()` doğru çalışıyor ama hydrate.js bunu duyurular için kullanmıyor
- `admin/index.html` — `saveAnnouncements()` fonksiyonu

**Çözüm Adımları:**
1. `src/scripts/hydrate.js` içinde `initHydration()` fonksiyonuna duyuru hydration'ı ekle
2. Duyuru listesi sayfası (`/duyurular`) için client-side render fonksiyonu yaz
3. Duyuru detay sayfası için slug bazlı lookup yaz
4. `src/scripts/announcements-page.js` adında yeni dosya oluştur

```javascript
// src/scripts/hydrate.js — initHydration() içine eklenecek
const annGrid = document.querySelector('.announcements-grid');
if (annGrid && config.announcements) {
  annGrid.innerHTML = config.announcements.length === 0
    ? '<div class="empty-state">...</div>'
    : config.announcements.map(ann => renderAnnouncementCard(ann)).join('');
}
```

---

### BUG-02 · Mobil Header: Logo Sola Kayıyor, Ortalanmıyor

**Sorun:** Mobilde logo sola kayıyor, `header__logo-center` class'ı mobilde çalışmıyor.

**Etkilenen Dosya:** `src/styles/layout.css` — Satır 221-235

**Düzeltme:**
```css
@media (max-width: 1024px) {
  .header {
    height: 60px;
  }
  .header__inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 var(--space-4);
  }
  .header__logo-center {
    position: static;
    transform: none;
    grid-column: 2;
    justify-self: center;
  }
  .mobile-only {
    grid-column: 3;
    justify-self: end;
  }
}
```

---

### BUG-03 · Top Bar Mobilde Çok Kötü Görünüyor

**Sorun:** Top bar mobilde tüm elementler üst üste biniyor, okunaksız hale geliyor.

**Etkilenen Dosya:** `src/styles/layout.css` — Satır ~110-125

**Düzeltme:**
```css
@media (max-width: 767px) {
  .top-bar {
    display: none; /* Mobilde top bar'ı tamamen gizle */
  }
}
@media (min-width: 768px) and (max-width: 1024px) {
  .top-bar .container {
    flex-direction: row;
    justify-content: center;
    gap: var(--space-4);
    font-size: 0.7rem;
  }
  .top-bar__right {
    display: none;
  }
}
```

---

### BUG-16-NEW · `vite.config.js` — `__dirname` ESM'de Tanımsız *(Mevcut Kodda Mevcut)*

**Sorun:** `vite.config.js` satır ~41'de `path.resolve(__dirname, ...)` kullanılıyor. Eğer `package.json`'da `"type": "module"` eklenirse `__dirname` tanımsız olur. Şu anki kodda bu sorun potansiyel olarak mevcut.

**Etkilenen Dosya:** `vite.config.js`

**Düzeltme (önlem amaçlı şimdiden uygula):**
```javascript
// vite.config.js'in en üstüne ekle:
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## 🟠 ÖNEMLİ — Yakın Vadede Düzeltilmeli

---

### BUG-04 · Galeri Sayfasında Boş State Mobil Layout Sorunu

**Sorun:** `gallery-page-grid` içindeki boş state `text-align:center` ile mobilde taşıyor.

**Etkilenen Dosya:** `src/build/site-renderer.js` — Gallery empty state HTML

**Düzeltme:** Empty state div'ine `max-width: 400px; margin: 0 auto;` ekle.

---

### BUG-05 · Duyuru Detay Sayfası — Hydration Çalışmıyor

**Sorun:** `/duyurular/:slug` URL'ine girildiğinde sayfa statik render ediliyor. Supabase'den yeni duyuru varsa build olmadan görünmüyor.

**Çözüm:**
```javascript
// src/scripts/announcements-page.js (YENİ DOSYA)
import { getSiteConfig } from '../supabase/site_config.js';

async function initAnnouncementDetail() {
  const slug = window.location.pathname.split('/duyurular/')[1]?.replace(/\/$/, '');
  if (!slug) return;
  const config = await getSiteConfig();
  const announcement = config.announcements?.find(a => slugify(a.title) === slug);
  if (!announcement) {
    document.getElementById('main-content').innerHTML = '<p>Duyuru bulunamadı.</p>';
    return;
  }
  document.title = `${announcement.title} | KGED`;
  document.getElementById('ann-title')?.textContent = announcement.title;
}
```

---

### BUG-06 · `sync-content.js` — `.env.local` Vercel'deki Env Var'ları Override Edebilir

**Etkilenen Dosya:** `src/build/sync-content.js` — Satır 6-15

**Düzeltme:**
```javascript
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const trimmedKey = key.trim();
        // Vercel'deki mevcut env var'ları koru
        if (!process.env[trimmedKey]) {
          process.env[trimmedKey] = valueParts.join('=').trim();
        }
      }
    });
  }
}
```

---

### BUG-07 · `supabase` Null Olduğunda `getSiteConfig()` Crash Yapıyor

**Etkilenen Dosya:** `src/supabase/site_config.js` — Satır 10

**Düzeltme:**
```javascript
export async function getSiteConfig() {
  if (!supabase) {
    console.warn('[KGED] Supabase bağlantısı yok, null döndürülüyor.');
    return null;
  }
  // ...
}
```

---

### BUG-08 · Admin Panel — `getStorageQuota` Dynamic Import Production'da Çalışmıyor

**Etkilenen Dosya:** `admin/index.html` — Satır ~760

**Düzeltme:** Dynamic import yerine dosya başına static import kullan.

---

### BUG-09 · Mobil Menü Açıkken Top Bar Z-Index Sorunu

**Etkilenen Dosya:** `src/styles/layout.css`

**Düzeltme:**
```css
.top-bar {
  position: relative;
  z-index: 799;
}
.nav--mobile {
  z-index: 4000;
}
```

---

### BUG-10 · Duyurular `content` HTML Doğrudan Render Ediliyor (XSS Riski)

**Etkilened Dosya:** `src/build/site-renderer.js` — Satır ~872

**Düzeltme:** Client-side hydration'da DOMPurify kullan:
```javascript
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(announcement.content);
```

---

### BUG-NEW-01 · Admin Panel'de Galeri Görselleri localStorage'da Tutuluyor (Mevcut Mimari)

**Sorun:** `admin/index.html`'deki mevcut implementasyon görselleri Base64 olarak `site-content.json`'a gömmekte. 5-10 fotoğraftan sonra JSON dosyası onlarca MB boyutuna ulaşır, Vite build belleği tüketir, Vercel'e deploy başarısız olur.

**Etkilenen Dosya:** `admin/index.html` — `handleImageAdd()` fonksiyonu

**Çözüm Seçenekleri (tercih sırasıyla):**
1. **Supabase Storage** — Görselleri bucket'a yükle, JSON'da sadece URL tut
2. **Cloudinary free tier** — Upload widget ile kolay entegrasyon
3. **GitHub Issues API** — Görsel hosting için geçici çözüm (ücretsiz)

**Acil önlem (şimdiki koda):**
```javascript
// handleImageAdd() içinde sıkıştırma limitini düşür:
const MAX_WIDTH = 600;      // 800'den 600'e düşür
canvas.toDataURL('image/jpeg', 0.4);  // 0.6'dan 0.4'e düşür
// + Toplam JSON boyutunu kontrol et, 2MB'ı geçerse uyar
const jsonStr = JSON.stringify(siteContent);
if (jsonStr.length > 2_000_000) {
  alert('UYARI: JSON boyutu 2MB\'ı geçti. Eski görselleri silmeyi düşünün.');
}
```

---

### BUG-NEW-02 · Admin Panel Şifresi Kaynak Kodda Açık Duruyor

**Sorun:** `admin/index.html` satır ~760'da:
```javascript
const ADMIN_PASS_HASH = hashString('kged2026');
```
`hashString()` fonksiyonu basit bir XOR hash, tersine çevrilebilir. Şifre kaynak kodunu okuyan herkes bulabilir.

**Etkilenen Dosya:** `admin/index.html`

**Düzeltme Seçenekleri:**
1. **Vercel Edge Middleware** ile `/admin` route'unu koru (en güvenli)
2. Firebase Auth veya Supabase Auth ile gerçek authentication
3. En azından hash'i bcrypt/PBKDF2 ile değiştir ve şifreyi hardcode etme:

```javascript
// Geçici iyileştirme — şifreyi env'den al, build'e göm:
// vite.config.js'de:
define: { __ADMIN_HASH__: JSON.stringify(process.env.ADMIN_HASH) }
// admin/index.html'de:
const ADMIN_PASS_HASH = __ADMIN_HASH__;
```

---

### BUG-NEW-03 · `dismissLoader()` — Çift `moveFocusToMain()` Çağrısı

**Sorun:** `src/scripts/loader.js` içinde `dismissLoader()` hem `transitionend` callback'inde hem de `setTimeout` fallback'inde `moveFocusToMain()` çağırıyor. `_called` guard var ama `loader.remove()` de iki kez çağrılıyor ve ikinci çağrı DOM hatası verebilir.

**Etkilenen Dosya:** `src/scripts/loader.js` — `dismissLoader()` fonksiyonu

**Düzeltme:**
```javascript
function dismissLoader(loader) {
  loader.classList.add('hidden');
  let removed = false;

  function cleanup() {
    if (removed) return;
    removed = true;
    loader.remove();
    moveFocusToMain();
  }

  loader.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(cleanup, 700);
}
```

---

### BUG-NEW-04 · `setActiveNavLink()` Yanlış Sayfaları Aktif İşaretliyor

**Sorun:** `src/scripts/nav.js` içindeki `setActiveNavLink()`:
```javascript
const isActive = href === currentPath || (href !== '' && currentPath.startsWith(href));
```
`href = '/h'` olan bir link `/hakkimizda` ile match edebilir. Daha da önemlisi, `/` (ana sayfa) tüm path'lerin başında olduğundan her sayfada aktif görünür.

**Etkilenen Dosya:** `src/scripts/nav.js` — `setActiveNavLink()` fonksiyonu

**Düzeltme:**
```javascript
function setActiveNavLink() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    // Exact match veya alt-path match (sadece / ile bitmeyenler için)
    const isActive = href === currentPath ||
      (href !== '/' && href.length > 1 && currentPath.startsWith(href + '/'));
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
```

---

### BUG-NEW-05 · `renderGalleryContent()` — Duplicate `gallery-lightbox` HTML

**Sorun:** `src/build/site-renderer.js` içinde `renderGalleryContent()` fonksiyonu `gallery-lightbox` div'ini **iki kez** render ediyor (satır ~1 ve satır ~son). Bu duplicate ID'ye ve JS hatalarına yol açar.

**Etkilenen Dosya:** `src/build/site-renderer.js` — `renderGalleryContent()` fonksiyon sonu

**Düzeltme:** Fonksiyonun sonundaki ikinci `<div id="gallery-lightbox"...>` bloğunu sil.

---

## 🟡 ORTA ÖNCELİK — Stabilite İyileştirmeleri

---

### BUG-11 · Mobilde Footer Grid Bozuluyor

**Etkilenen Dosya:** `src/styles/layout.css` — Satır ~460-465

**Düzeltme:**
```css
@media (max-width: 767px) {
  .footer__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    text-align: center;
  }
  .footer__social { justify-content: center; }
  .footer__contact-info { align-items: center; }
}
```

---

### BUG-12 · `initHydration()` Duyuru Sayfasını Güncellemiyor

**Etkilened Dosya:** `src/scripts/hydrate.js` — BUG-01 ile birlikte çözülmeli

---

### BUG-13 · `iletisim` Breadcrumb Canonical Türkçe Karakter Encode Sorunu

**Etkilened Dosya:** `src/build/site-renderer.js` — Satır ~115 `getPageMeta()`

---

### BUG-14 · Admin Panel — Board Kaydetme Butonu Eksik

**Etkilened Dosya:** `admin/index.html` — `renderBoardUI()` fonksiyonu

**Düzeltme:** `renderBoardUI()` içine `<button onclick="window.handleSaveBoard()">Kaydet</button>` ekle.

---

### BUG-15 · Galeri `getStorageQuota()` — Recursive Directory List Yapmıyor

**Etkilened Dosya:** `src/supabase/gallery.js` — Satır 78-95

---

### BUG-17 · Mobilde `.contact-grid` İki Sütun Kalıyor

**Etkilened Dosya:** `src/styles/layout.css`

**Düzeltme:**
```css
@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr !important;
  }
}
```

---

### BUG-18 · Announcement Card `content` İçindeki HTML Tags Listeyi Bozuyor

**Etkilened Dosya:** `src/build/site-renderer.js` — Satır ~871

---

### BUG-19 · Hydration Race Condition — DOM Hazır Olmadan Supabase Fetch

**Öneri:** Skeleton loader ekle, hydration tamamlanana kadar içerik alanlarını skeleton göster.

---

### BUG-NEW-06 · `content.gallery.items` Undefined Olduğunda Galeri Çöküyor

**Sorun:** `src/build/site-renderer.js` içinde `renderGalleryContent()` satırında:
```javascript
galleryItems = ${JSON.stringify((content.gallery && content.gallery.items) ? content.gallery.items.sort(...) : [])}
```
`content.gallery` tanımlı ama `content.gallery.items` undefined ise `.sort()` çağrısı crash yapar.

**Düzeltme:**
```javascript
const items = Array.isArray(content.gallery?.items) ? content.gallery.items : [];
const sortedItems = [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
```

---

### BUG-NEW-07 · `footer-year` Sadece Ana Sayfada Güncelleniyor

**Sorun:** `src/scripts/main.js` satır ~25'te `footer-year` span'ı güncelleniyor ama `renderFooter()` içindeki `id="footer-year"` tüm sayfalarda mevcut. Bu kodun `DOMContentLoaded` içinde çalışması nedeniyle aslında çalışıyor, sorun yok. **Ama** 404 sayfasında minimal footer kullanılıyor (`{ minimal: true }`) ve orada da `id="footer-year"` var — farklı footer template'lerde id çakışması oluşabilir.

**Etkilened Dosya:** `src/build/site-renderer.js` — `renderFooter()` minimal ve full versiyonları

---

## 🟢 DÜŞÜK ÖNCELİK — Genel İyileştirmeler

---

### BUG-NEW-08 · `CSP` Header Firebase/Supabase Domain'lerini Kapsamamıyor

**Sorun:** `vercel.json` içindeki `Content-Security-Policy`:
```
connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com
```
Supabase veya Firebase bağlantıları kullanılıyorsa `connect-src`'e eklenmeli, aksi takdirde production'da tüm Supabase çağrıları CSP tarafından bloklanır.

**Etkilened Dosya:** `vercel.json`

**Düzeltme:**
```json
"connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com https://*.supabase.co https://firebaseapp.com https://*.googleapis.com"
```

---

### BUG-NEW-09 · `prefers-reduced-motion` Loader'ı Anında Kaldırıyor Ama `body.ready` Flash Oluşturuyor

**Sorun:** `initLoader()` `prefersReduced` ise anında `dismissLoader()` çağırıyor. Ama `dismissLoader()` CSS transition ile `hidden` class ekliyor. `prefers-reduced-motion` aktifken transition süreleri `0.01ms` olduğu için geçiş OK, ama `body.ready` opacity transition de `0.01ms` oluyor — bu zaten doğru davranış. Küçük bir not olarak belgelendi.

---

## 🆕 YENİ ÖZELLİK — URL Bazlı Haber/Link Preview Sistemi

---

### FEAT-01 · Duyurulara URL Girince Otomatik Haber Önizleme Çekme

#### Genel Konsept

Admin, duyuru oluştururken bir haber URL'si girer. Sistem otomatik olarak:
1. O URL'deki sayfanın `<title>`, `og:title`, `og:description`, `og:image` meta taglarını çeker
2. Bunları önizleme olarak admin'de gösterir
3. Onaylanınca `site-content.json`'a `linkPreview` objesi olarak kaydeder
4. Galeri/duyurular sayfasında kart olarak gösterir, tıklayınca orijinal kaynağa yönlendirir

#### Mimari — CORS Sorunu ve Çözümü

Tarayıcıdan doğrudan başka domaine istek göndermek CORS politikası nedeniyle bloklanır. İki seçenek:

**Seçenek A (Önerilen) — Vercel Edge Function:**
```
/api/fetch-preview?url=https://example.com/haber
```
```javascript
// api/fetch-preview.js (Vercel Serverless Function)
export default async function handler(req, res) {
  const { url } = req.query;
  
  // Güvenlik: Sadece HTTP/HTTPS URL'lere izin ver
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Geçersiz URL' });
  }
  
  // Rate limiting (basit — IP bazlı)
  // TODO: Vercel KV ile gerçek rate limiting eklenebilir
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KGED-LinkPreview/1.0 (https://kirshehirgormeengelliler.org.tr)',
      },
      signal: AbortSignal.timeout(8000), // 8 saniye timeout
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    
    // HTML'den meta tagları parse et
    const getMetaContent = (property) => {
      const match = html.match(
        new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')
      ) || html.match(
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`, 'i')
      );
      return match?.[1] || null;
    };
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    const preview = {
      url,
      title: getMetaContent('og:title') || titleMatch?.[1]?.trim() || url,
      description: getMetaContent('og:description') || getMetaContent('description') || '',
      image: getMetaContent('og:image') || getMetaContent('twitter:image') || null,
      siteName: getMetaContent('og:site_name') || new URL(url).hostname.replace('www.', ''),
      fetchedAt: Date.now(),
    };
    
    // Görsel URL'ini absolute yap
    if (preview.image && !preview.image.startsWith('http')) {
      const base = new URL(url);
      preview.image = new URL(preview.image, base.origin).toString();
    }
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.json(preview);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

**Seçenek B — Ücretsiz Üçüncü Taraf API'ler:**
```javascript
// Alternatif — microlink.io ücretsiz tier (1000 istek/ay)
const PREVIEW_API = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;

// Alternatif — jsonlink.io
const PREVIEW_API = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`;
```

#### Admin Panel — URL Preview UI

`admin/index.html` içindeki duyuru oluşturma formuna eklenecek:

```html
<!-- Duyuru formuna ekle -->
<div class="form-group" id="link-preview-section" style="display:none;">
  <label class="form-label">Haber Linki (Opsiyonel)</label>
  <div style="display:flex; gap:0.5rem;">
    <input type="url" 
           id="ann-link-url" 
           placeholder="https://kaynakhaber.com/haber-basligi" 
           style="flex:1; border:1px solid var(--border); padding:0.5rem; border-radius:var(--radius-sm);" />
    <button type="button" 
            id="btn-fetch-preview" 
            style="padding:0.5rem 1rem; background:var(--brand-600); color:#fff; border:none; border-radius:var(--radius-sm); cursor:pointer; white-space:nowrap;">
      Önizle
    </button>
  </div>
  
  <!-- Önizleme kartı — fetch sonrası görünür -->
  <div id="link-preview-card" style="display:none; margin-top:1rem; border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; background:#fff;">
    <div style="display:flex; gap:1rem; padding:1rem; align-items:flex-start;">
      <img id="preview-img" 
           src="" 
           alt="" 
           style="width:120px; height:80px; object-fit:cover; border-radius:4px; flex-shrink:0; background:var(--surface);" />
      <div style="flex:1; min-width:0;">
        <p id="preview-title" style="font-weight:600; margin-bottom:0.25rem; font-size:0.9rem; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;"></p>
        <p id="preview-desc" style="font-size:0.8rem; color:var(--text-muted); overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;"></p>
        <p id="preview-site" style="font-size:0.75rem; color:var(--text-faint); margin-top:0.25rem;"></p>
      </div>
    </div>
    <div style="background:var(--surface); padding:0.5rem 1rem; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:0.75rem; color:var(--text-faint);">Bu bilgiler duyuru kartında gösterilecek</span>
      <button type="button" 
              id="btn-clear-preview" 
              style="font-size:0.75rem; color:#EF4444; background:none; border:none; cursor:pointer;">
        Kaldır
      </button>
    </div>
  </div>
  
  <div id="preview-status" style="font-size:0.85rem; margin-top:0.5rem;"></div>
</div>
```

```javascript
// Admin panel JavaScript — Link Preview fetch
let currentLinkPreview = null;

async function fetchLinkPreview(url) {
  const statusEl = document.getElementById('preview-status');
  const card = document.getElementById('link-preview-card');
  const btn = document.getElementById('btn-fetch-preview');
  
  statusEl.innerHTML = '<span style="color:var(--brand-600);">⏳ Sayfa bilgileri çekiliyor...</span>';
  btn.disabled = true;
  card.style.display = 'none';
  
  try {
    // Kendi Vercel endpoint'imiz
    const res = await fetch(`/api/fetch-preview?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    currentLinkPreview = data;
    
    // Önizleme kartını doldur
    const imgEl = document.getElementById('preview-img');
    if (data.image) {
      imgEl.src = data.image;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
    document.getElementById('preview-title').textContent = data.title;
    document.getElementById('preview-desc').textContent = data.description;
    document.getElementById('preview-site').textContent = `🔗 ${data.siteName}`;
    
    card.style.display = 'block';
    statusEl.innerHTML = '<span style="color:#059669;">✅ Önizleme hazır!</span>';
    
  } catch (err) {
    statusEl.innerHTML = `<span style="color:#EF4444;">❌ Hata: ${err.message}. URL'yi manuel girebilirsiniz.</span>`;
    // Hata olsa bile URL'i kaydet — başlık/açıklama admin tarafından manuel girilebilir
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('btn-fetch-preview')?.addEventListener('click', () => {
  const url = document.getElementById('ann-link-url').value.trim();
  if (!url) return;
  fetchLinkPreview(url);
});

document.getElementById('btn-clear-preview')?.addEventListener('click', () => {
  currentLinkPreview = null;
  document.getElementById('link-preview-card').style.display = 'none';
  document.getElementById('ann-link-url').value = '';
  document.getElementById('preview-status').innerHTML = '';
});
```

#### `site-content.json` — Veri Yapısı

```json
{
  "announcements": [
    {
      "id": "ann-001",
      "title": "Kırşehir'de Görme Engelliler İçin Yeni Destek Programı",
      "content": "Kısa özet metni...",
      "category": "haber",
      "createdAt": 1744300000000,
      "linkPreview": {
        "url": "https://kaynakhaber.com/haber-basligi",
        "title": "Kırşehir'de Görme Engelliler İçin Yeni Destek Programı",
        "description": "Programın detayları açıklandı...",
        "image": "https://kaynakhaber.com/images/haber.jpg",
        "siteName": "kaynakhaber.com",
        "fetchedAt": 1744300000000
      }
    }
  ]
}
```

#### Duyuru Kartı — Site-Renderer Render Çıktısı

`src/build/site-renderer.js` içinde `renderAnnouncementCard(ann)` fonksiyonu:

```javascript
function renderAnnouncementCard(ann) {
  const hasLink = ann.linkPreview?.url;
  const tag = hasLink ? 'a' : 'article';
  const tagAttrs = hasLink
    ? `href="${escapeAttr(ann.linkPreview.url)}" target="_blank" rel="noopener noreferrer"`
    : '';
  
  const imageHtml = ann.linkPreview?.image
    ? `<div class="ann-card__image">
        <img src="${escapeAttr(ann.linkPreview.image)}" 
             alt="${escapeAttr(ann.linkPreview.title || ann.title)}"
             loading="lazy" />
       </div>`
    : '';

  const sourceHtml = hasLink
    ? `<span class="ann-card__source">
        <svg ...><!-- external link icon --></svg>
        ${escapeHtml(ann.linkPreview.siteName || new URL(ann.linkPreview.url).hostname)}
       </span>`
    : '';

  return `<${tag} class="ann-card${hasLink ? ' ann-card--linked' : ''}" ${tagAttrs}>
    ${imageHtml}
    <div class="ann-card__body">
      <span class="ann-card__cat ann-card__cat--${escapeAttr(ann.category || 'genel')}">
        ${escapeHtml(annCategoryLabels[ann.category] || 'Genel')}
      </span>
      <h3 class="ann-card__title">${escapeHtml(ann.title)}</h3>
      <p class="ann-card__desc">${escapeHtml(
        ann.linkPreview?.description || ann.content || ''
      )}</p>
      <div class="ann-card__footer">
        <time class="ann-card__date" datetime="${new Date(ann.createdAt).toISOString()}">
          ${new Date(ann.createdAt).toLocaleDateString('tr-TR', {day:'numeric',month:'long',year:'numeric'})}
        </time>
        ${sourceHtml}
      </div>
    </div>
  </${tag}>`;
}
```

#### CSS — Duyuru Kartı Stilleri

```css
/* src/styles/components.css'e eklenecek */

.ann-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}

.ann-card--linked:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--color-primary-300);
}

.ann-card__image {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--color-surface);
  flex-shrink: 0;
}

.ann-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.ann-card--linked:hover .ann-card__image img {
  transform: scale(1.03);
}

.ann-card__body {
  padding: var(--space-5);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ann-card__cat {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ann-card__cat--haber { background: var(--color-info-bg); color: var(--color-info-text); }
.ann-card__cat--duyuru { background: var(--color-warning-bg); color: var(--color-warning-text); }
.ann-card__cat--etkinlik { background: var(--color-success-bg); color: var(--color-success-text); }

.ann-card__title {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
  line-height: var(--leading-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ann-card__desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  margin-bottom: var(--space-4);
}

.ann-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.ann-card__date {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.ann-card__source {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-primary-600);
  font-weight: var(--weight-medium);
}

.ann-card__source svg {
  width: 12px;
  height: 12px;
}
```

#### Güvenlik Notları

```markdown
⚠️ URL Doğrulama (api/fetch-preview.js içinde zorunlu):
1. Sadece http/https URL'lere izin ver
2. Özel IP adresleri ve localhost'u engelle (SSRF koruması):
   - 127.0.0.1, 10.x.x.x, 192.168.x.x, 169.254.x.x
3. Maximum response boyutunu sınırla (örn. 500KB)
4. Fetch timeout: 8 saniye
5. Admin-only endpoint — Vercel'de `/api/fetch-preview`'a 
   sadece admin panelinden erişilebilmeli
   (veya basit bir token ile koru)

SSRF Koruması için:
```javascript
const parsed = new URL(url);
const hostname = parsed.hostname;
// Private IP range check
if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(hostname)
    || hostname === 'localhost') {
  return res.status(400).json({ error: 'Bu IP aralığına erişim yasak' });
}
```
```

#### Uygulama Adımları (Sıralı)

```
[ ] 1. api/fetch-preview.js Vercel serverless function oluştur
        - URL validation + SSRF koruması
        - HTML fetch + meta tag parsing
        - Cache-Control header
        - Rate limiting (opsiyonel başlangıçta)

[ ] 2. admin/index.html — Duyuru formuna URL alanı + önizleme kartı ekle
        - btn-fetch-preview event listener
        - Önizleme göster/kaldır
        - currentLinkPreview state'i duyuru kaydetme fonksiyonuna entegre et

[ ] 3. site-content.json şemasına linkPreview objesi ekle

[ ] 4. src/build/site-renderer.js — renderAnnouncementCard() güncelle
        - linkPreview varsa kart <a> olsun
        - Görsel render
        - Kaynak site gösterimi

[ ] 5. src/styles/components.css — ann-card stilleri ekle

[ ] 6. vercel.json — CSP'ye fetch-preview API'nin ihtiyaçları için 
        connect-src genişlet

[ ] 7. Test: 
        - Görsel olmayan URL
        - CORS engelleyen URL (fallback manual)
        - Çok uzun başlık/açıklama (line-clamp test)
        - Mobil görünüm
        - prefers-reduced-motion (hover animation)
```

---

## 📋 ÖZET TABLO

| Bug ID | Öncelik | Dosya | Konu |
|--------|---------|-------|------|
| BUG-01 | 🔴 Kritik | `src/scripts/hydrate.js` | Duyurular Supabase'den gelmiyor |
| BUG-02 | 🔴 Kritik | `src/styles/layout.css` | Mobil logo sola kayıyor |
| BUG-03 | 🔴 Kritik | `src/styles/layout.css` | Top bar mobil bozuk |
| BUG-16 | 🔴 Kritik | `vite.config.js` | `__dirname` ESM sorunu |
| BUG-04 | 🟠 Önemli | `src/build/site-renderer.js` | Galeri boş state mobil |
| BUG-05 | 🟠 Önemli | Yeni `announcements-page.js` | Detay sayfası statik |
| BUG-06 | 🟠 Önemli | `src/build/sync-content.js` | Vercel env var override |
| BUG-07 | 🟠 Önemli | `src/supabase/site_config.js` | Null check eksik |
| BUG-08 | 🟠 Önemli | `admin/index.html` | Dynamic import prod'da çalışmıyor |
| BUG-09 | 🟠 Önemli | `src/styles/layout.css` | Mobil menü z-index |
| BUG-10 | 🟠 Önemli | `src/build/site-renderer.js` | XSS / DOMPurify eksik |
| BUG-NEW-01 | 🟠 Önemli | `admin/index.html` | Base64 JSON boyut patlaması |
| BUG-NEW-02 | 🟠 Önemli | `admin/index.html` | Şifre kaynak kodda açık |
| BUG-NEW-03 | 🟠 Önemli | `src/scripts/loader.js` | Çift `remove()` çağrısı |
| BUG-NEW-04 | 🟠 Önemli | `src/scripts/nav.js` | Active link yanlış match |
| BUG-NEW-05 | 🟠 Önemli | `src/build/site-renderer.js` | Duplicate lightbox HTML |
| BUG-11 | 🟡 Orta | `src/styles/layout.css` | Footer grid mobil |
| BUG-12 | 🟡 Orta | `src/scripts/hydrate.js` | Duyuru hydration eksik |
| BUG-13 | 🟡 Orta | `src/build/site-renderer.js` | Breadcrumb canonical |
| BUG-14 | 🟡 Orta | `admin/index.html` | Board kaydet butonu yok |
| BUG-15 | 🟡 Orta | `src/supabase/gallery.js` | Quota recursive list yok |
| BUG-17 | 🟡 Orta | `src/styles/layout.css` | Contact grid mobil |
| BUG-18 | 🟡 Orta | `src/build/site-renderer.js` | HTML strip eksik |
| BUG-19 | 🟡 Orta | `src/scripts/main.js` | Hydration race condition |
| BUG-NEW-06 | 🟡 Orta | `src/build/site-renderer.js` | `gallery.items` undefined crash |
| BUG-NEW-07 | 🟡 Orta | `src/build/site-renderer.js` | Duplicate `footer-year` ID |
| BUG-NEW-08 | 🟢 Düşük | `vercel.json` | CSP Supabase domain eksik |
| BUG-NEW-09 | 🟢 Düşük | `src/scripts/loader.js` | Reduced-motion notu |
| FEAT-01 | 🆕 Yeni | `api/` + `admin/` + renderer | URL bazlı link preview |

---

## 🎯 Önerilen Düzeltme Sırası

### Sprint 1 — CSS/Layout Hızlı Fix (1-2 saat)
1. **BUG-02** — Mobil header logo ortalama (`layout.css` ~10 satır)
2. **BUG-03** — Top bar mobil gizleme (`layout.css` ~5 satır)
3. **BUG-11 + BUG-17** — Footer ve contact grid mobil (~8 satır)
4. **BUG-09** — Mobil menü z-index (~4 satır)

### Sprint 2 — JS Bug'ları (2-3 saat)
5. **BUG-NEW-03** — Loader çift remove fix
6. **BUG-NEW-04** — Active nav link düzeltmesi
7. **BUG-NEW-05** — Duplicate lightbox HTML kaldır
8. **BUG-NEW-06** — Gallery items null check
9. **BUG-16** — `__dirname` ESM fix

### Sprint 3 — Güvenlik ve Stabilite (3-4 saat)
10. **BUG-07** — Supabase null check
11. **BUG-NEW-02** — Şifre güvenliği
12. **BUG-NEW-01** — Base64 boyut uyarısı
13. **BUG-06** — Env var override fix
14. **BUG-08** — Admin dynamic import fix
15. **BUG-NEW-08** — CSP header güncelleme

### Sprint 4 — Duyuru Sistemi (4-6 saat)
16. **BUG-01 + BUG-12** — Hydrate.js duyuru hydration
17. **BUG-05** — `announcements-page.js` yeni dosya
18. **BUG-14** — Admin board kaydet butonu

### Sprint 5 — Yeni Özellik: Link Preview (6-8 saat)
19. **FEAT-01** — Tüm adımlar yukarıda belgelenmiş

---

*Son güncelleme: 11 Nisan 2026. Her bug uygulanmadan önce ilgili dosyayı tekrar okuyun.*


BUG-NEW-01 — Base64 görsel patlaması: 5-10 fotoğraftan sonra JSON dosyası devasa boyuta ulaşır, Vercel deploy başarısız olur. Acil sıkıştırma limiti düşürme + boyut uyarısı gerekiyor
BUG-NEW-02 — Admin şifresi (kged2026) kaynak kodda düz okunuyor, basit XOR hash tersine çevrilebilir
BUG-NEW-03 — loader.js içinde loader.remove() hem transitionend hem setTimeout callback'inde çalışıyor, çift çağrı
BUG-NEW-04 — Active nav link: / (anasayfa) tüm path'lerin başında olduğu için her sayfada aktif görünüyor
BUG-NEW-05 — renderGalleryContent() fonksiyonu gallery-lightbox HTML'ini iki kez üretiyor
BUG-NEW-06 — gallery.items undefined olduğunda .sort() crash yapıyor
BUG-NEW-07 — Minimal footer ve full footer'da id="footer-year" çakışması
BUG-NEW-08 — vercel.json CSP header'ında Supabase domain'leri yok, production'da tüm Supabase çağrıları bloklanır

Link Preview özelliği için:
Temel sorun CORS — tarayıcıdan başka domain'lere istek gönderemezsiniz. Çözüm Vercel Serverless Function (/api/fetch-preview.js): admin URL girer → endpoint sayfayı fetch eder → og:title, og:description, og:image taglarını parse eder → JSON döner. SSRF koruması için özel IP aralıkları (127.x, 10.x, 192.168.x) engellenmeli. Kart <a> tag'e dönüşüp orijinal kaynağa yönlendirir, 1 saatlik cache ile gereksiz tekrar fetch önlenir.
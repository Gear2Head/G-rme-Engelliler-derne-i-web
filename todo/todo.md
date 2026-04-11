# KGED — Acil Fix & Admin İyileştirme TODO

**Tarih:** 11 Nisan 2026  
**Ekran Görüntüsü Analizi:** Admin CSP hataları + `/duyurular/ofis` → 404

---

## 🔴 ACİL — Hemen Yapılacaklar

---

### FIX-01 · `vercel.json` CSP — DOMPurify ve Supabase Bloklanıyor

**Console'daki hata:**
```
Connecting to https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js
violates Content Security Policy directive: "connect-src 'self'"
```
```
https://*.supabase.co wss://*.supabase.co — The action has been blocked.
```

**Etkilenen Dosya:** `vercel.json`

**Mevcut (kırık) CSP:**
```json
"script-src 'self' 'unsafe-inline'",
"connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com"
```

**Düzeltme:**
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://www.google.com https://maps.google.com; connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com https://*.supabase.co wss://*.supabase.co https://images.unsplash.com https://va.vercel-scripts.com"
}
```

**Değişiklikler:**
- `script-src` → `cdnjs.cloudflare.com` eklendi (DOMPurify)
- `connect-src` → `*.supabase.co`, `wss://*.supabase.co`, `images.unsplash.com`, `va.vercel-scripts.com` eklendi
- `img-src` → `blob:` eklendi (canvas/file preview için)

---

### FIX-02 · `/duyurular/:slug` → 404 Atıyor

**Sorun:** `kirged.org/duyurular/ofis` açıldığında 404 veriyor.  
İki ayrı kök neden var:

**Neden A — Vercel Routing:** `/duyurular/ofis` için statik bir `.html` dosyası yok.  
Vercel `cleanUrls: true` ile çalışıyor ama `duyurular/ofis/index.html` hiç üretilmiyor.

**Neden B — Dinamik Route Yok:** Duyuru sayfası client-side slug ile çalışmalı ama `duyurular/[slug].html` shell'i build'e dahil değil.

**Çözüm — 3 Adım:**

**Adım 1: `vercel.json`'a rewrites ekle**
```json
{
  "rewrites": [
    { "source": "/duyurular/:slug", "destination": "/duyurular/detay" }
  ]
}
```
Bu `/duyurular/ofis`, `/duyurular/herhangi-bir-sey` gibi tüm URL'leri `/duyurular/detay` sayfasına yönlendirir, URL'i değiştirmeden.

**Adım 2: `duyurular/detay/index.html` shell dosyası oluştur**
```html
<!DOCTYPE html>
<html lang="tr" data-theme="light">
<head>
  <!--app-head-->
</head>
<body>
  <!--app-body-->
  <script type="module" src="/src/scripts/main.js"></script>
  <script type="module" src="/src/scripts/announcement-detail.js"></script>
</body>
</html>
```

**Adım 3: `src/scripts/announcement-detail.js` oluştur**
```javascript
/**
 * AMAÇ: Duyuru detay sayfası — URL slug'ına göre Supabase'den içerik çek
 * MANTIK: window.location.pathname'den slug al → getSiteConfig() → eşleşen duyuruyu render et
 */
import { getSiteConfig } from '../supabase/site_config.js';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function initAnnouncementDetail() {
  // URL: /duyurular/ofis → slug: "ofis"
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1];

  if (!slug || slug === 'detay') {
    // Slug yok, duyurular listesine yönlendir
    window.location.replace('/duyurular');
    return;
  }

  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;

  // Skeleton göster
  mainEl.innerHTML = `
    <div style="max-width:800px;margin:4rem auto;padding:0 1.5rem;">
      <div style="height:2rem;background:var(--color-surface);border-radius:8px;margin-bottom:1rem;animation:pulse 1.5s ease infinite;"></div>
      <div style="height:1rem;background:var(--color-surface);border-radius:8px;width:60%;margin-bottom:2rem;animation:pulse 1.5s ease infinite;"></div>
      <div style="height:300px;background:var(--color-surface);border-radius:16px;animation:pulse 1.5s ease infinite;"></div>
    </div>
    <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}</style>`;

  try {
    const config = await getSiteConfig();
    if (!config || !config.announcements) throw new Error('İçerik yüklenemedi');

    const ann = config.announcements.find(a => slugify(a.title) === slug);

    if (!ann) {
      mainEl.innerHTML = `
        <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;">
          <div>
            <p style="font-size:4rem;margin-bottom:1rem;">🔍</p>
            <h1 style="font-size:1.75rem;margin-bottom:0.75rem;">Duyuru Bulunamadı</h1>
            <p style="color:var(--color-text-muted);margin-bottom:2rem;">Bu duyuru kaldırılmış veya adres değişmiş olabilir.</p>
            <a href="/duyurular" class="btn btn--primary">Tüm Duyurular</a>
          </div>
        </div>`;
      return;
    }

    // Başlık ve meta güncelle
    document.title = `${ann.title} | KGED`;
    document.querySelector('meta[name="description"]')
      ?.setAttribute('content', ann.summary || ann.content?.replace(/<[^>]+>/g,'').slice(0,160) || '');

    // Görsel
    const imgHtml = ann.image
      ? `<img src="${ann.image}" alt="${ann.title}" 
             style="width:100%;max-height:420px;object-fit:cover;border-radius:16px;margin-bottom:2rem;" />`
      : '';

    // İçerik — DOMPurify ile sanitize et
    const rawContent = ann.content || ann.summary || '';
    const cleanContent = (typeof DOMPurify !== 'undefined')
      ? DOMPurify.sanitize(rawContent)
      : rawContent.replace(/<script[^>]*>.*?<\/script>/gi, '');

    const dateStr = ann.date
      ? new Date(ann.date).toLocaleDateString('tr-TR', {day:'numeric', month:'long', year:'numeric'})
      : '';

    mainEl.innerHTML = `
      <article style="max-width:800px;margin:3rem auto;padding:0 1.5rem 4rem;">
        
        <!-- Breadcrumb -->
        <nav aria-label="Sayfa konumu" style="margin-bottom:2rem;">
          <ol style="display:flex;gap:0.5rem;list-style:none;font-size:0.85rem;color:var(--color-text-muted);flex-wrap:wrap;">
            <li><a href="/" style="color:var(--color-text-link);text-decoration:none;">Ana Sayfa</a></li>
            <li aria-hidden="true" style="color:var(--color-text-faint);">›</li>
            <li><a href="/duyurular" style="color:var(--color-text-link);text-decoration:none;">Duyurular</a></li>
            <li aria-hidden="true" style="color:var(--color-text-faint);">›</li>
            <li aria-current="page" style="color:var(--color-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${ann.title}</li>
          </ol>
        </nav>

        <!-- Kategori + Tarih -->
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1.25rem;">
          ${ann.category ? `<span style="padding:3px 12px;background:var(--color-primary-50);color:var(--color-primary-700);border-radius:999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${ann.category}</span>` : ''}
          ${dateStr ? `<time style="font-size:0.85rem;color:var(--color-text-muted);" datetime="${ann.date || ''}">${dateStr}</time>` : ''}
        </div>

        <!-- Başlık -->
        <h1 style="font-size:clamp(1.5rem,5vw,2.5rem);font-weight:800;line-height:1.2;letter-spacing:-0.03em;margin-bottom:1.5rem;color:var(--color-text);">
          ${ann.title}
        </h1>

        <!-- Görsel -->
        ${imgHtml}

        <!-- İçerik -->
        <div class="typography" style="color:var(--color-text-muted);line-height:1.8;font-size:1.05rem;">
          ${cleanContent}
        </div>

        <!-- Link Preview varsa -->
        ${ann.linkPreview ? `
          <a href="${ann.linkPreview.url}" target="_blank" rel="noopener noreferrer"
             style="display:flex;gap:1rem;margin-top:2.5rem;padding:1.25rem;border:1px solid var(--color-border);border-radius:12px;text-decoration:none;color:inherit;background:var(--color-bg-card);transition:box-shadow 200ms ease;"
             onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'"
             onmouseout="this.style.boxShadow='none'">
            ${ann.linkPreview.image ? `<img src="${ann.linkPreview.image}" alt="" style="width:100px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0;" />` : ''}
            <div style="min-width:0;">
              <p style="font-size:0.7rem;color:var(--color-text-faint);margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.05em;">${ann.linkPreview.siteName || ''}</p>
              <p style="font-weight:600;font-size:0.9rem;margin-bottom:0.25rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${ann.linkPreview.title || ''}</p>
              <p style="font-size:0.8rem;color:var(--color-text-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${ann.linkPreview.description || ''}</p>
            </div>
          </a>` : ''}

        <!-- Geri Dön -->
        <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--color-border);">
          <a href="/duyurular" class="btn btn--secondary">← Tüm Duyurulara Dön</a>
        </div>

      </article>`;

  } catch (err) {
    console.error('[KGED] Duyuru yüklenemedi:', err);
    mainEl.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;">
        <p style="font-size:1rem;color:var(--color-error-text);">İçerik yüklenirken hata oluştu. Lütfen sayfayı yenileyin.</p>
        <a href="/duyurular" class="btn btn--primary" style="margin-top:1rem;">Duyurulara Dön</a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', initAnnouncementDetail);
```

**Adım 4: `vite.config.js` rollupOptions'a `detay` entry ekle**
```javascript
// vite.config.js — rollupOptions.input'a ekle:
detay: resolve(__dirname, 'duyurular/detay/index.html'),
```

---

### FIX-03 · Admin'e Link ile Duyuru Paylaşma Özelliği

**Sorun:** Admin panelde duyuru formunda URL alanı yok.

**Ekran görüntüsündeki mevcut form alanları:** Başlık, Tarih, Duyuru Detayı, Görsel Seç

**Eklenecekler (Admin JS içinde duyuru form render fonksiyonuna):**

```javascript
// Mevcut duyuru form HTML'ine — "Görsel Seç" bloğunun ALTINA ekle:

`<!-- Haber Linki Bölümü -->
<div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #eee;">
  <label style="display:block;font-size:0.8rem;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">
    Haber Kaynağı Linki <span style="font-weight:400;color:#94A3B8;">(opsiyonel)</span>
  </label>
  
  <div style="display:flex;gap:0.5rem;">
    <input type="url"
           id="ann-link-${ann.id}"
           placeholder="https://kaynakhaber.com/haber-basligi"
           value="${ann.linkPreview?.url || ''}"
           style="flex:1;height:44px;padding:0 0.75rem;border:1.5px solid #E2E8F0;border-radius:8px;font-size:0.9rem;font-family:inherit;outline:none;transition:border-color 150ms;"
           onfocus="this.style.borderColor='#6366F1'"
           onblur="this.style.borderColor='#E2E8F0'" />
    <button type="button"
            onclick="window.fetchAnnLinkPreview('${ann.id}')"
            style="height:44px;padding:0 1rem;background:#4F46E5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;white-space:nowrap;transition:background 150ms;"
            onmouseover="this.style.background='#4338CA'"
            onmouseout="this.style.background='#4F46E5'">
      Önizle
    </button>
  </div>

  <!-- Yükleniyor -->
  <div id="ann-link-loading-${ann.id}" style="display:none;font-size:0.85rem;color:#6366F1;margin-top:0.5rem;">
    ⏳ Sayfa bilgileri çekiliyor...
  </div>

  <!-- Önizleme Kartı -->
  <div id="ann-link-preview-${ann.id}" style="display:${ann.linkPreview ? 'flex' : 'none'};gap:0.75rem;margin-top:0.75rem;padding:0.75rem;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8F9FC;align-items:flex-start;">
    <img id="ann-link-img-${ann.id}"
         src="${ann.linkPreview?.image || ''}"
         alt=""
         style="width:80px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0;background:#E2E8F0;display:${ann.linkPreview?.image ? 'block' : 'none'};" />
    <div style="flex:1;min-width:0;">
      <p id="ann-link-title-${ann.id}"
         style="font-weight:600;font-size:0.85rem;margin-bottom:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
        ${ann.linkPreview?.title || ''}
      </p>
      <p id="ann-link-desc-${ann.id}"
         style="font-size:0.75rem;color:#64748B;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
        ${ann.linkPreview?.description || ''}
      </p>
      <p id="ann-link-site-${ann.id}"
         style="font-size:0.7rem;color:#94A3B8;margin-top:3px;">
        🔗 ${ann.linkPreview?.siteName || ''}
      </p>
    </div>
    <button type="button"
            onclick="window.clearAnnLinkPreview('${ann.id}')"
            style="font-size:0.75rem;color:#EF4444;background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;"
            title="Linki kaldır">✕</button>
  </div>

  <!-- Hata mesajı -->
  <p id="ann-link-error-${ann.id}" style="display:none;font-size:0.8rem;color:#EF4444;margin-top:0.5rem;"></p>
</div>`
```

**Admin JS — fetch ve clear fonksiyonları:**

```javascript
// window scope'a ekle — her duyuru kartı için çalışır

window.fetchAnnLinkPreview = async function(annId) {
  const urlInput = document.getElementById(`ann-link-${annId}`);
  const loadingEl = document.getElementById(`ann-link-loading-${annId}`);
  const previewEl = document.getElementById(`ann-link-preview-${annId}`);
  const errorEl = document.getElementById(`ann-link-error-${annId}`);
  const url = urlInput?.value?.trim();

  if (!url) return;
  if (!/^https?:\/\//i.test(url)) {
    errorEl.textContent = 'Geçerli bir URL girin (https:// ile başlamalı)';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  previewEl.style.display = 'none';
  loadingEl.style.display = 'block';

  try {
    // Seçenek A: Kendi Vercel endpoint'in
    const res = await fetch(`/api/fetch-preview?url=${encodeURIComponent(url)}`);
    
    // Seçenek B (fallback — endpoint yoksa): microlink.io
    // const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Preview state'i duyuru objesine kaydet
    const annIndex = announcements.findIndex(a => a.id === annId);
    if (annIndex !== -1) {
      announcements[annIndex].linkPreview = {
        url,
        title: data.title || url,
        description: data.description || '',
        image: data.image || null,
        siteName: data.siteName || new URL(url).hostname.replace('www.', ''),
        fetchedAt: Date.now(),
      };
    }

    // UI güncelle
    const preview = announcements[annIndex]?.linkPreview;
    if (preview) {
      const imgEl = document.getElementById(`ann-link-img-${annId}`);
      document.getElementById(`ann-link-title-${annId}`).textContent = preview.title;
      document.getElementById(`ann-link-desc-${annId}`).textContent = preview.description;
      document.getElementById(`ann-link-site-${annId}`).textContent = `🔗 ${preview.siteName}`;
      if (preview.image) { imgEl.src = preview.image; imgEl.style.display = 'block'; }
      previewEl.style.display = 'flex';
    }

  } catch (err) {
    errorEl.textContent = `Önizleme yüklenemedi: ${err.message}. URL yine de kaydedilecek.`;
    errorEl.style.display = 'block';
    // Hata olsa bile sadece URL'i kaydet
    const annIndex = announcements.findIndex(a => a.id === annId);
    if (annIndex !== -1) {
      announcements[annIndex].linkPreview = { url, title: url, fetchedAt: Date.now() };
    }
  } finally {
    loadingEl.style.display = 'none';
  }
};

window.clearAnnLinkPreview = function(annId) {
  const annIndex = announcements.findIndex(a => a.id === annId);
  if (annIndex !== -1) delete announcements[annIndex].linkPreview;
  
  document.getElementById(`ann-link-${annId}`).value = '';
  document.getElementById(`ann-link-preview-${annId}`).style.display = 'none';
  document.getElementById(`ann-link-error-${annId}`).style.display = 'none';
};
```

---

### FIX-04 · `api/fetch-preview.js` — Vercel Serverless Function

**Yeni dosya oluştur:** `api/fetch-preview.js`

```javascript
/**
 * AMAÇ: URL'den OG meta tagları çek — CORS bypass için proxy endpoint
 * MANTIK: SSRF koruması + timeout + cache header
 */

// Private IP SSRF koruması
function isPrivateIP(hostname) {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|::1|fc00:|fe80:)/.test(hostname);
}

function getMetaContent(html, ...properties) {
  for (const prop of properties) {
    const match =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']{1,500})["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']{1,500})["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export default async function handler(req, res) {
  // Sadece GET
  if (req.method !== 'GET') return res.status(405).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url parametresi gerekli' });

  // URL validasyon
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Geçersiz URL formatı' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Sadece HTTP/HTTPS URL desteklenir' });
  }

  // SSRF koruması
  if (isPrivateIP(parsed.hostname)) {
    return res.status(400).json({ error: 'Bu IP aralığına erişim yasak' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KGED-LinkPreview/1.0 (+https://kirged.org)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr,en;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Max 500KB oku
    const reader = response.body.getReader();
    let html = '';
    let bytes = 0;
    const MAX_BYTES = 500_000;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      html += new TextDecoder().decode(value);
      if (bytes >= MAX_BYTES) { reader.cancel(); break; }
    }

    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
    let ogImage = getMetaContent(html, 'og:image', 'twitter:image');

    // Görsel URL'ini absolute yap
    if (ogImage && !ogImage.startsWith('http')) {
      try { ogImage = new URL(ogImage, `${parsed.origin}/`).toString(); } catch { ogImage = null; }
    }

    const preview = {
      url,
      title: getMetaContent(html, 'og:title', 'twitter:title') || titleMatch?.[1]?.trim() || parsed.hostname,
      description: getMetaContent(html, 'og:description', 'description', 'twitter:description') || '',
      image: ogImage,
      siteName: getMetaContent(html, 'og:site_name') || parsed.hostname.replace('www.', ''),
      fetchedAt: Date.now(),
    };

    // 1 saatlik cache, 24 saat stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', 'https://kirged.org');
    res.json(preview);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Sayfa zaman aşımına uğradı (8s)' });
    }
    res.status(500).json({ error: `Fetch hatası: ${err.message}` });
  }
}
```

---

## 🟠 ÖNEMLİ — Admin Panel UX İyileştirmeleri

---

### IMPROVE-01 · Admin Duyuru Formu — Kaydet Butonu Feedback Eksik

**Sorun:** "Kaydet" butonuna basıldığında kullanıcı başarılı/başarısız durumu görmüyor.

**Düzeltme:**
```javascript
async function saveAnnouncements() {
  const btn = document.getElementById('btn-save-announcements'); // veya ilgili buton
  const originalText = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '⏳ Kaydediliyor...';
  
  try {
    await saveSiteConfig({ announcements });
    btn.innerHTML = '✅ Kaydedildi!';
    btn.style.background = '#059669';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2000);
  } catch (err) {
    btn.innerHTML = '❌ Hata!';
    btn.style.background = '#EF4444';
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
    console.error('[KGED] Kayıt hatası:', err);
  }
}
```

---

### IMPROVE-02 · Admin Duyuru — Önizleme Linki Çalışmıyor

**Sorun:** Ekran görüntüsünde "Önizleme: /duyurular/ofis" linki mevcut. Bu linke tıklanınca 404 atıyor (FIX-02 düzeltince çözülecek).

**Ek düzeltme:** Önizleme linki yeni sekmede açılmalı:
```javascript
// Önizleme link render'ına ekle:
`<a href="/duyurular/${slugify(ann.title)}" 
   target="_blank" 
   rel="noopener"
   style="color:#6366F1;font-size:0.8rem;text-decoration:none;">
   Önizleme: /duyurular/${slugify(ann.title)} ↗
</a>`
```

---

### IMPROVE-03 · Duyuru Detay İçeriği `<p>` Tagları Görünüyor

**Sorun:** Ekran görüntüsünde "Duyuru Detayı" textarea'sında:
```
<p>Kırşehir Neşet Ertaş Kültür Merkezindeki Ofisimizde sizi bekliyoruz.</p>
```
HTML tagları text olarak görünüyor. Admin kullanıcı HTML yazmak zorunda kalmamalı.

**Düzeltme Seçenekleri:**
1. **Basit (önerilen):** Textarea'yı `contenteditable` div'e çevir, basit bold/italic toolbar ekle
2. **Hızlı Fix:** `<p>` taglarını otomatik ekle/kaldır — input düz metin olsun, kaydetmede `<p>` wrap, gösterimde strip:

```javascript
// Kaydetmede: düz metin → HTML
function textToHtml(text) {
  return text.split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Formda göstermede: HTML → düz metin
function htmlToText(html) {
  return html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// Textarea value set ederken:
textarea.value = htmlToText(ann.content || '');
// Kaydetmede:
ann.content = textToHtml(textarea.value);
```

---

## 📋 ÖZET — Yapılacaklar Listesi

### Önce Bunlar (Sitenin çalışması için kritik)

```
[1] vercel.json — CSP güncelle (DOMPurify + Supabase)           → FIX-01
[2] vercel.json — rewrites ekle (/duyurular/:slug → /detay)     → FIX-02 Adım 1
[3] duyurular/detay/index.html — shell oluştur                  → FIX-02 Adım 2
[4] src/scripts/announcement-detail.js — yeni dosya             → FIX-02 Adım 3
[5] vite.config.js — detay entry ekle                           → FIX-02 Adım 4
```

### Sonra Bunlar (Link preview özelliği)

```
[6] api/fetch-preview.js — Vercel serverless function           → FIX-04
[7] Admin form — URL input + önizle butonu HTML ekle            → FIX-03 HTML
[8] Admin JS — fetchAnnLinkPreview() ve clearAnnLinkPreview()   → FIX-03 JS
[9] linkPreview objesi saveSiteConfig()'e dahil ediliyor mu?    → Kontrol et
```

### Admin UX

```
[10] Kaydet butonu feedback animasyonu                          → IMPROVE-01
[11] Önizleme linki yeni sekmede aç                            → IMPROVE-02
[12] Textarea'da HTML tag görünümünü düzelt                     → IMPROVE-03
```

---

*11 Nisan 2026*


Tespit edilen 3 kritik sorun:
1. CSP (FIX-01) — En Kolay Fix
Console'da iki hata görüyorum: DOMPurify cdnjs.cloudflare.com'dan yüklenemiyor çünkü CSP'de yok. Supabase (*.supabase.co, wss://*.supabase.co) da bloklanıyor. vercel.json'daki tek satırı güncellemek yeterli.
2. 404 Sorunu (FIX-02) — 4 Adım
/duyurular/ofis 404 atıyor çünkü bu URL için ne statik bir HTML dosyası var ne de Vercel routing rule'u. Çözüm: vercel.json'a rewrite ekle → tüm /duyurular/:slug isteklerini duyurular/detay/ sayfasına yönlendir → o shell sayfa JS ile slug'ı URL'den okusun → Supabase'den duyuruyu çeksin.
3. Link Preview Özelliği (FIX-03 + FIX-04)
Admin formuna URL alanı + "Önizle" butonu eklenecek. Tarayıcıdan CORS nedeniyle direkt fetch yapılamaz, bu yüzden api/fetch-preview.js Vercel serverless function şart — bu endpoint sayfayı sunucu tarafında fetch edip og:title, og:image, og:description taglarını parse edip döner. SSRF koruması için özel IP aralıkları engellenmiş halde.
Bonus — IMPROVE-03: Textarea'da <p>Kırşehir Neşet Ertaş...</p> gibi ham HTML tagları görünüyor. Kaydetmede düz metni otomatik <p> wrap eden, formda HTML'i düz metne çeviren iki yardımcı fonksiyon ile bu düzeltilir.
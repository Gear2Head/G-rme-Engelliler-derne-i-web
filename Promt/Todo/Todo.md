# KGED Web Sitesi — Kapsamlı Geliştirme & Bug Fix TODO Listesi

> Bu belge bir AI ajanına yönelik hazırlanmıştır. Her madde hangi **dosya**, hangi **satır/metin**, ne **değişmeli** şeklinde açıklanmıştır.

---

## 🔴 KRİTİK BUGLAR (Önce Bunlar)

---

### BUG-01: Supabase Anon Key doğrudan kaynak kodda — Güvenlik Açığı
**Dosya:** `src/supabase/config.js`
**Mevcut metin:**
```js
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_z0GaCKmabd0X0OLDqYZp5w_IROXedRY';
```
**Yapılacak değişiklik:**
- Fallback string'i tamamen kaldır. Sadece env değişkeninden oku:
```js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[KGED] Supabase ortam değişkenleri eksik. .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```
- `.env.example` dosyası oluştur:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```
- `.gitignore` içinde `.env` satırının var olduğundan emin ol.

---

### BUG-02: Galeri sayfasında `getGalleryItems()` hata aldığında boş liste render ediliyor, kullanıcıya hata gösterilmiyor
**Dosya:** `src/build/site-renderer.js`
**İlgili bölüm:** `renderGalleryContent()` içindeki inline `<script type="module">` — `initGallery()` fonksiyonu
**Mevcut metin:**
```js
async function initGallery() {
  const grid = document.getElementById('gallery-page-grid');
  grid.innerHTML = '<div style="grid-column:1/-1;...">Görseller Yükleniyor...</div>';
  try {
    const items = await getGalleryItems();
    if (items) galleryItems = items;
  } catch (err) {
    console.error("Galeri yükleme hatası:", err);
  }
  renderGalleryPage();
  initIntersectionObserver();
}
```
**Yapılacak değişiklik:** Hata durumunda kullanıcıya hata mesajı göster ve retry butonu ekle:
```js
async function initGallery() {
  const grid = document.getElementById('gallery-page-grid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;">Görseller Yükleniyor...</div>';
  try {
    const items = await getGalleryItems();
    galleryItems = Array.isArray(items) ? items : [];
  } catch (err) {
    console.error("Galeri yükleme hatası:", err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-error-text);">
      <p>Görseller yüklenirken bir hata oluştu.</p>
      <button onclick="initGallery()" style="margin-top:1rem;padding:0.5rem 1.5rem;background:var(--color-primary-600);color:#fff;border:none;border-radius:9999px;cursor:pointer;">Tekrar Dene</button>
    </div>`;
    return;
  }
  renderGalleryPage();
  initIntersectionObserver();
}
window.initGallery = initGallery;
```

---

### BUG-03: Galeri lazy-load `IntersectionObserver` — `renderGalleryPage()` sonrası observer yeniden başlatılmıyor
**Dosya:** `src/build/site-renderer.js`
**İlgili bölüm:** `window.filterGallery` fonksiyonu
**Mevcut metin:**
```js
window.filterGallery = function(btn, cat) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = cat;
  renderGalleryPage();
};
```
**Yapılacak değişiklik:** `renderGalleryPage()` sonrasında `initIntersectionObserver()` çağır:
```js
window.filterGallery = function(btn, cat) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = cat;
  renderGalleryPage();
  setTimeout(initIntersectionObserver, 50); // DOM settle sonrası
};
```

---

### BUG-04: `getGalleryItems()` fallback select'inde `order` sütunu eksik, sonradan yükleme sırası bozuluyor
**Dosya:** `src/supabase/gallery.js`
**Mevcut metin (satır ~55):**
```js
const { data: fallbackData, error: fallbackError } = await supabase
  .from('gallery_items')
  .select('id, url, caption, category, created_at, order')
  .order('created_at', { ascending: false });
```
**Sorun:** `order` bir SQL reserved keyword — Supabase PostgREST ile çakışabilir. Kolon adı tırnak içinde olmalı. Ayrıca sıralama hem `order` hem `created_at` üzerinden yapılmalı:
```js
const { data: fallbackData, error: fallbackError } = await supabase
  .from('gallery_items')
  .select('id, url, caption, category, created_at, "order"')
  .order('"order"', { ascending: true })
  .order('created_at', { ascending: false });
```

---

### BUG-05: Admin panelinde `stat-gallery` ve `stat-gallery-big` element ID'leri mevcut DOM'da yok — JS hata veriyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `loadGalleryManagement()` fonksiyonu içinde:
```js
document.getElementById('stat-gallery').textContent = galleryCount;
if (document.getElementById('stat-gallery-big')) {
  document.getElementById('stat-gallery-big').textContent = galleryCount;
}
```
**Sorun:** `renderDashboardHome()` ile oluşturulan HTML'de bu ID'ler tanımlı değil, null referans hatası oluşuyor.
**Yapılacak değişiklik:** Her iki satırı da null-safe hale getir:
```js
const statEl = document.getElementById('stat-gallery');
if (statEl) statEl.textContent = galleryCount;
const statBigEl = document.getElementById('stat-gallery-big');
if (statBigEl) statBigEl.textContent = galleryCount;
```

---

### BUG-06: `uploadGalleryImage()` içinde `sanitizePath` türkçe karakter dönüşümü eksik — bazı karakterler kırpılıyor
**Dosya:** `src/supabase/gallery.js`
**Mevcut metin:**
```js
function sanitizePath(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9_.\-]/g, '');
}
```
**Sorun:** `İ` (büyük noktalı İ) `i`'ye dönüştürülüyor ama küçük harf dönüşümünden önce replace yapıldığı için çalışıyor, ancak path başında timestamp olmadan çakışma riski var. Ayrıca dosya adı boş kalabilir.
**Yapılacak değişiklik:**
```js
function sanitizePath(str) {
  if (!str) return `file_${Date.now()}`;
  const result = str
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i').replace(/[iİ]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.\-]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/^[_.\-]+|[_.\-]+$/g, '');
  return result || `file_${Date.now()}`;
}
```

---

### BUG-07: Admin panel `handleSaveBoard` butonu DOM'a ekleniyor ama `renderBoardUI()` içinde `id="btn-save-board"` olan buton yok
**Dosya:** `admin/index.html`
**Mevcut metin — `renderBoardUI()`:**
```js
function renderBoardUI() {
  return `
    <div class="panel-card fade-in">
      <div class="panel-card__header"><div class="panel-card__title">Yönetim Kurulu</div></div>
      ...
    </div>
  `;
}
```
**Sorun:** Panel header'ında kaydet butonu eksik. `window.handleSaveBoard` tanımlı ama çağrılan buton yok.
**Yapılacak değişiklik:** Header'a kaydet butonu ekle:
```js
function renderBoardUI() {
  return `
    <div class="panel-card fade-in">
      <div class="panel-card__header">
        <div class="panel-card__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Yönetim Kurulu
        </div>
        <button id="btn-save-board" class="btn btn--primary" onclick="window.handleSaveBoard()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Kaydet
        </button>
      </div>
      <div class="panel-card__body">
        <div class="board-rows-list" id="board-editor-list"></div>
        <button class="btn btn--dashed" onclick="window.addBoardMember()">+ Yeni Üye Ekle</button>
      </div>
    </div>
  `;
}
```

---

### BUG-08: Galeri lightbox'ta albüm içi görseller için `lbItems` filtresi albüm açılmadan önce hesaplanıyor — yanlış index
**Dosya:** `src/build/site-renderer.js`
**İlgili bölüm:** `window.openLightbox` fonksiyonu
**Mevcut metin:**
```js
window.openLightbox = function(id) {
   lbIndex = lbItems.findIndex(i => String(i.id) === String(id));
   if (lbIndex === -1) return;
   ...
};
```
**Sorun:** `lbItems` global filtreye göre güncel, ama albüm içi bir görsele tıklandığında `lbItems` tüm filtrelenmiş listeyi içeriyor, albüm sıralamasını yansıtmıyor.
**Yapılacak değişiklik:** `openLightbox`'a hangi grubun lightbox'ını açtığını belirten parametre ekle veya her görsel kartına `data-lightbox-group` ekle:
```js
// renderGalleryItem() içinde img tag:
imgHtml = `<img ... onclick="window.openLightbox('${lid}', '${item.album_id || ''}')" .../>`;

window.openLightbox = function(id, albumContext) {
  let contextItems = lbItems;
  if (albumContext) {
    contextItems = lbItems.filter(i => (i.album_id || '') === albumContext);
  }
  lbIndex = contextItems.findIndex(i => String(i.id) === String(id));
  if (lbIndex === -1) return;
  // Store context for nav
  window._lbContextItems = contextItems;
  const lb = document.getElementById('gallery-lightbox');
  updateLightboxStateWithItems(contextItems, lbIndex);
  lb.classList.add('open');
  lb.focus();
  document.body.style.overflow = 'hidden';
};

// updateLightboxState parametreli hale getirilmeli:
function updateLightboxStateWithItems(items, idx) {
  if (idx < 0 || idx >= items.length) return;
  const item = items[idx];
  // ... mevcut logic
  document.getElementById('lightbox-prev').style.display = idx > 0 ? 'flex' : 'none';
  document.getElementById('lightbox-next').style.display = idx < items.length - 1 ? 'flex' : 'none';
}

window.navLightbox = function(dir) {
  const items = window._lbContextItems || lbItems;
  const newIdx = lbIndex + dir;
  if (newIdx >= 0 && newIdx < items.length) {
    lbIndex = newIdx;
    updateLightboxStateWithItems(items, lbIndex);
  }
};
```

---

### BUG-09: `addGalleryItem()` içinde fallback retry `album_id` null olduğunda body'ye dahil edilmemeli ama `is_cover` da kaldırılmıyor
**Dosya:** `src/supabase/gallery.js`
**Mevcut metin (fallbackPayload):**
```js
const fallbackPayload = {
  url: item.url,
  caption: item.caption,
  category: item.category,
  order: item.order ?? 0
};
```
**Sorun:** `alt_text` da schema mismatch'e yol açabilir, fallback'te yok ama hata mesajı sadece `album_id` ve `alt_text`'i kontrol ediyor. `is_cover` da eklenememiş.
**Yapılacak değişiklik:** Hata tespit mekanizmasını daha sağlam hale getir:
```js
const SCHEMA_ERROR_CODES = ['PGRST204', '42703'];
const SCHEMA_ERROR_KEYWORDS = ['album_id', 'alt_text', 'is_cover', 'column'];

function isSchemaError(error) {
  return SCHEMA_ERROR_CODES.includes(error.code) ||
    error.status === 400 ||
    SCHEMA_ERROR_KEYWORDS.some(kw => (error.message || '').toLowerCase().includes(kw));
}

export async function addGalleryItem(item) {
  const payload = {
    url: item.url,
    caption: item.caption,
    category: item.category,
    order: item.order ?? 0,
    ...(item.album_id ? { album_id: item.album_id } : {}),
    ...(item.alt_text ? { alt_text: item.alt_text } : {}),
    ...(item.is_cover !== undefined ? { is_cover: item.is_cover } : {}),
  };

  const { data, error } = await supabase.from('gallery_items').insert([payload]);

  if (error) {
    if (isSchemaError(error)) {
      console.warn('[KGED] Schema mismatch, core-only retry...');
      const { data: retryData, error: retryError } = await supabase
        .from('gallery_items')
        .insert([{ url: item.url, caption: item.caption, category: item.category, order: item.order ?? 0 }]);
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }
  return data;
}
```

---

### BUG-10: Galeri admin — `deleteGalleryItem` başarısız storage silme işlemi UI'da hata göstermiyor, başarılıymış gibi davranıyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `window.handleDeleteGallery` fonksiyonu
**Mevcut metin:**
```js
window.handleDeleteGallery = async (id, url) => {
  if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
  try {
    ...
    await deleteGalleryItem(id, path);
    showToast('Görsel başarıyla silindi.', 'success');
    loadGalleryManagement();
  } catch (e) {
    showToast('Silme hatası: ' + e.message, 'error');
  }
};
```
**Yapılacak değişiklik:** Butonu silme sırasında disable et, daha iyi UX sağla:
```js
window.handleDeleteGallery = async (id, url) => {
  if (!confirm('Bu görseli kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.')) return;
  const btn = event.currentTarget;
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Siliniyor...';
  try {
    let path = null;
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/storage/v1/object/public/gallery/');
      if (parts.length > 1) path = decodeURIComponent(parts[1]);
    } catch {}
    await deleteGalleryItem(id, path);
    showToast('Görsel başarıyla silindi.', 'success');
    loadGalleryManagement();
  } catch (e) {
    showToast('Silme hatası: ' + (e.message || 'Bilinmeyen hata'), 'error');
    btn.disabled = false;
    btn.innerHTML = oldText;
  }
};
```

---

## 🟠 ÖNEMLİ İYİLEŞTİRMELER

---

### FIX-01: Galeri sayfasında filtreleme butonu her renderGalleryPage() çağrısında "Tümü" seçili gibi reset'leniyor
**Dosya:** `src/build/site-renderer.js`
**Sorun:** `renderGalleryPage()` fonksiyonu içindeki `lbItems` hesaplaması doğru ama filter state `currentFilter` render sırasında kaybolmuyor. Ancak albüm collapse/expand işleminde `filterGallery` çağrılmadan `renderGalleryPage()` doğrudan çağrılıyor — durum doğru tutulmalı.
**Yapılacak değişiklik:** `renderGalleryPage()` fonksiyonunu, `currentFilter` state'ini koruyacak şekilde bırak. Albüm toggle butonlarını `renderGalleryPage()` üzerinden değil, doğrudan DOM manipülasyonu ile yönet (class toggle ile). Bu zaten mevcut ama `gallery-album-header` onclick inline string ile yapılıyor — event delegation'a geç:
```js
// renderGalleryPage() sonunda:
grid.addEventListener('click', function(e) {
  const header = e.target.closest('.gallery-album-header');
  if (header) {
    header.parentElement.classList.toggle('expanded');
  }
}, { once: false });
```
Ve inline onclick'leri kaldır: `onclick="this.parentElement.classList.toggle('expanded')"` → sadece class bırak, event delegation yönetsin.

---

### FIX-02: Admin panel `renderSiteInfoUI()` sadece `about.title` ve `about.intro` kaydediyor — diğer alanlar kaybolabiliyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `window.handleSaveConfig` fonksiyonu
**Mevcut metin:**
```js
siteContent.about.title = document.getElementById('edit-about-title')?.value || '';
siteContent.about.intro = document.getElementById('edit-about-intro')?.value || '';
siteContent.contact.phone = document.getElementById('edit-contact-phone')?.value || '';
siteContent.contact.email = document.getElementById('edit-contact-email')?.value || '';
```
**Sorun:** `siteContent` üzerinden tüm nesne Supabase'e yazılıyor ama UI'da sadece 4 alan var. Bu tasarım gereği çalışıyor ama `contact.phoneHref`, `contact.emailHref` gibi türetilmiş alanlar güncellenmeden kalıyor.
**Yapılacak değişiklik:** Telefon/email değeri güncellendiğinde href'leri de güncelle:
```js
window.handleSaveConfig = async () => {
  if (!siteContent) return;
  const btn = document.getElementById('btn-save-config');
  btn.disabled = true; btn.textContent = 'Kaydediliyor...';
  try {
    siteContent.about.title = document.getElementById('edit-about-title')?.value?.trim() || siteContent.about.title;
    siteContent.about.intro = document.getElementById('edit-about-intro')?.value?.trim() || siteContent.about.intro;
    
    const phone = document.getElementById('edit-contact-phone')?.value?.trim();
    if (phone) {
      siteContent.contact.phone = phone;
      // Türkiye numarası formatı: 0541 648 45 70 -> +905416484570
      const digits = phone.replace(/\D/g, '');
      siteContent.contact.phoneHref = digits.startsWith('0')
        ? `tel:+90${digits.slice(1)}`
        : `tel:+${digits}`;
    }
    
    const email = document.getElementById('edit-contact-email')?.value?.trim();
    if (email) {
      siteContent.contact.email = email;
      siteContent.contact.emailHref = `mailto:${email}`;
    }
    
    await saveSiteConfig(siteContent);
    showToast('Site bilgileri güncellendi ✓', 'success');
  } catch (e) {
    showToast('Hata: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Kaydet';
  }
};
```

---

### FIX-03: `getSiteConfig()` veri yoksa `null` dönüyor — hydrate.js bunu sessizce skip ediyor, hata yakalanamıyor
**Dosya:** `src/scripts/hydrate.js`
**Mevcut metin:**
```js
export async function initHydration() {
  try {
    const config = await getSiteConfig();
    if (!config) return;
    ...
  } catch (err) {
    console.warn('[KGED] Hydrate hatası:', err);
  }
}
```
**Yapılacak değişiklik:** `null` durumunu loglayarak daha açık hale getir:
```js
const config = await getSiteConfig();
if (!config) {
  console.info('[KGED] Supabase site_config boş — statik verilerle devam ediliyor.');
  return;
}
```

---

### FIX-04: Galeri admin'de görsel yükleme sırasında aynı dosya birden fazla kez queue'ya eklenebiliyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `addFilesToQueue()` fonksiyonu
**Yapılacak değişiklik:** Duplicate kontrolü ekle (aynı isim+boyut):
```js
function addFilesToQueue(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const remaining = MAX_FILES - pendingFiles.length;
  
  // Duplicate filter
  const existingKeys = new Set(pendingFiles.map(f => `${f.name}_${f.size}`));
  const uniqueNew = imageFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
  const duplicateCount = imageFiles.length - uniqueNew.length;
  
  if (duplicateCount > 0) showToast(`${duplicateCount} tekrarlanan görsel atlandı.`, 'info');
  if (remaining <= 0) { showToast(`Maksimum ${MAX_FILES} görsel yükleyebilirsiniz.`, 'error'); return; }
  
  const toAdd = uniqueNew.slice(0, remaining);
  if (uniqueNew.length > remaining) showToast(`${uniqueNew.length - remaining} görsel limit nedeniyle eklenmedi.`, 'info');
  
  pendingFiles.push(...toAdd);
  renderPreview();
  
  // Reset file input so same file can be re-selected after removal
  document.getElementById('upload-file-real').value = '';
}
```

---

### FIX-05: Admin sidebar tab geçişi sırasında siteContent henüz yüklenmemişken `renderSectionView()` çalışıyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `window.switchTab` fonksiyonu
**Mevcut metin:**
```js
window.switchTab = (tab, el) => {
  ...
  if (tab === 'dashboard') {
    ...
  } else {
    sectionsView.style.display = 'block';
    renderSectionView(tab);
  }
};
```
**Yapılacak değişiklik:** `siteContent` null kontrolü ekle:
```js
window.switchTab = async (tab, el) => {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  const dashView = document.getElementById('admin-view-dashboard');
  const sectionsView = document.getElementById('admin-view-sections');
  const root = document.getElementById('admin-sections-root');

  dashView.style.display = 'none';
  sectionsView.style.display = 'none';
  root.innerHTML = '';

  if (tab === 'dashboard') {
    dashView.style.display = 'block';
    renderDashboardHome();
  } else {
    sectionsView.style.display = 'block';
    
    // siteContent henüz yüklenmediyse bekle
    if (!siteContent) {
      root.innerHTML = '<div style="padding:2rem;text-align:center;">Veriler yükleniyor...</div>';
      await loadSiteContent();
    }
    
    renderSectionView(tab);
  }
};
```

---

### FIX-06: `vercel.json` CSP — Supabase realtime WebSocket bağlantıları için `connect-src` eksik
**Dosya:** `vercel.json`
**Mevcut metin (Content-Security-Policy value):**
```
"connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com https://*.supabase.co"
```
**Sorun:** Supabase realtime için `wss://*.supabase.co` eksik. Ayrıca `https://va.vercel-scripts.com` analytics için gerekli.
**Yapılacak değişiklik:**
```
"connect-src 'self' https://maps.googleapis.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co"
```
Ayrıca `script-src` için `https://va.vercel-scripts.com` ekle:
```
"script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com"
```

---

### FIX-07: Admin panel `compressImage()` — WebP formatında dosyalar için extension hatalı kalıyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `window.handleImageAdd` içinde:
```js
const ext = file.name.split('.').pop() || 'jpg';
const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
const publicUrl = await uploadGalleryImage(compressed, path);
```
**Sorun:** `compressImage()` her zaman JPEG blob döndürüyor (`'image/jpeg'`), ama path orijinal extension ile oluşturuluyor. Supabase'de Content-Type yanlış olabilir.
**Yapılacak değişiklik:**
```js
const compressed = await compressImage(file);
// compressImage her zaman JPEG üretir
const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
const publicUrl = await uploadGalleryImage(compressed, path);
```
Ve `uploadGalleryImage()` fonksiyonuna Content-Type ekle:
```js
export async function uploadGalleryImage(file, path) {
  const safePath = sanitizePath(path);
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(safePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg' // Blob'dan type al
    });
  if (error) throw error;
  ...
}
```

---

### FIX-08: Galeri sayfasında mobil'de lightbox keyboard navigasyonu çalışmıyor — touch swipe yok
**Dosya:** `src/build/site-renderer.js`
**İlgili bölüm:** Galeri lightbox event listener'ları
**Yapılacak değişiklik:** Touch swipe desteği ekle:
```js
// Lightbox swipe support
let touchStartX = 0;
let touchStartY = 0;
const lbEl = document.getElementById('gallery-lightbox');
lbEl.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
lbEl.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    window.navLightbox(dx < 0 ? 1 : -1);
  }
}, { passive: true });
```

---

## 🟡 ORTA ÖNCELİKLİ DÜZELTMELER

---

### FIX-09: `site-renderer.js` inline gallery script modül import'u production build'de yanlış path alıyor
**Dosya:** `src/build/site-renderer.js`
**Mevcut metin:**
```html
<script type="module">
  import { getGalleryItems } from '/src/supabase/gallery.js';
```
**Sorun:** Vite build sırasında bu inline script içindeki import path'i Vite tarafından resolve edilmiyor. Production build'de `/src/supabase/gallery.js` 404 verir.
**Yapılacak değişiklik:** Bu scripti ayrı bir dosyaya taşı:
1. `src/scripts/gallery-page.js` dosyası oluştur ve tüm galeri inline script içeriğini buraya taşı.
2. `renderGalleryContent()` içindeki `<script type="module">` bloğunu şunla değiştir:
```html
<script type="module" src="/src/scripts/gallery-page.js"></script>
```
3. Galeri sayfası artık Vite tarafından doğru şekilde bundle edilecek.

---

### FIX-10: `hydrate.js` board render'ı `escapeHtml` fonksiyonunu inline tanımlıyor — DRY ihlali ve potansiyel XSS riski
**Dosya:** `src/scripts/hydrate.js`
**Mevcut metin:**
```js
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    ...
}
```
**Sorun:** `site-renderer.js`'de de aynı fonksiyon var. Ortak utility'e taşı.
**Yapılacak değişiklik:**
1. `src/utils/html.js` oluştur:
```js
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```
2. `hydrate.js` ve `site-renderer.js`'de: `import { escapeHtml } from '../utils/html.js';`

---

### FIX-11: Admin panel tema toggle — sayfa yenilenmeden dark mode icon durumu yanlış başlıyor
**Dosya:** `admin/index.html`
**İlgili bölüm:** `applyTheme()` çağrısı
**Mevcut metin:**
```js
getSession().then(session => {
  applyTheme(localStorage.getItem('kged-theme') || ...);
  if (session) showDashboard();
  else showLogin();
});
```
**Sorun:** `applyTheme` login sayfasında da çalışmalı, ancak admin app gizli olduğunda icon'lar zaten DOM'da var. Sorun değil, ama login sayfasında da `<meta name="theme-color">` güncellenmeli.
**Yapılacak değişiklik:** `applyTheme` içine meta tag güncellemesi ekle:
```js
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0E14' : '#4F46E5');
  iconSun.style.display = theme === 'dark' ? 'block' : 'none';
  iconMoon.style.display = theme === 'dark' ? 'none' : 'block';
}
```

---

### FIX-12: `vite.config.js` — `admin/index.html` giriş noktası var ama `admin` klasörü için ayrı CSS split yok
**Dosya:** `vite.config.js`
**Mevcut metin:**
```js
input: {
  main: resolve(__dirname, 'index.html'),
  ...
  admin: resolve(__dirname, 'admin/index.html'),
},
```
**Sorun:** Admin paneli prod'da siteyle aynı bundle'ı paylaşıyor — admin için gereksiz CSS yükleniyor. Bu öncelikli değil ama admin CSS'ini ayrı tut.
**Yapılacak değişiklik:** Admin paneli kendi kendine yeterliyse (ki öyle — inline style'ları var), Vite CSS split varsayılan olarak çalışır. `cssCodeSplit: true` zaten var. Sorun yok, ancak admin'in `main.css` import etmediğinden emin ol — admin `index.html` içinde `<link rel="stylesheet">` veya JS import yok, sadece inline `<style>` var. Kontrol et, temiz.

---

## 🚀 İLERİ DÜZEY GELİŞTİRME ÖZELLİKLERİ (En Az 10)

---

### FEATURE-01: Gerçek zamanlı Galeri Güncellemeleri (Supabase Realtime)
**Hedef:** Admin panelinden yeni görsel yüklendiğinde galeri sayfası otomatik güncellensin.
**Dosya oluştur:** `src/scripts/gallery-realtime.js`
```js
import { supabase } from '../supabase/config.js';

export function subscribeGalleryUpdates(onInsert, onDelete) {
  return supabase
    .channel('gallery_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'gallery_items'
    }, (payload) => onInsert(payload.new))
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'gallery_items'
    }, (payload) => onDelete(payload.old))
    .subscribe();
}
```
**Dosya:** `src/scripts/gallery-page.js` içinde kullan:
```js
import { subscribeGalleryUpdates } from './gallery-realtime.js';

// initGallery() sonunda:
subscribeGalleryUpdates(
  (newItem) => {
    galleryItems.unshift(newItem);
    renderGalleryPage();
    initIntersectionObserver();
  },
  (deletedItem) => {
    galleryItems = galleryItems.filter(i => i.id !== deletedItem.id);
    renderGalleryPage();
  }
);
```

---

### FEATURE-02: Görsel Optimizasyonu — WebP Dönüşümü ve AVIF Fallback
**Hedef:** Yüklenen görselleri WebP formatına dönüştür, dosya boyutunu %40-60 azalt.
**Dosya:** `admin/index.html` — `compressImage()` fonksiyonu
**Yapılacak değişiklik:**
```js
async function compressImage(file, format = 'webp') {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMG_DIM || height > MAX_IMG_DIM) {
          if (width > height) { height = Math.round(height * MAX_IMG_DIM / width); width = MAX_IMG_DIM; }
          else { width = Math.round(width * MAX_IMG_DIM / height); height = MAX_IMG_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        
        // WebP destekleniyorsa WebP, yoksa JPEG
        const mimeType = format === 'webp' && canvas.toDataURL('image/webp').startsWith('data:image/webp')
          ? 'image/webp' : 'image/jpeg';
        const quality = mimeType === 'image/webp' ? 0.80 : IMG_QUALITY;
        
        canvas.toBlob((blob) => resolve(blob || file), mimeType, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```
**Path değişikliği:** `handleImageAdd()` içinde extension'ı MIME type'a göre belirle:
```js
const compressed = await compressImage(file);
const ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
const path = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
```

---

### FEATURE-03: Galeri Sayfası — Sonsuz Kaydırma (Infinite Scroll) ile Sayfalama
**Hedef:** Çok sayıda görselde performans için pagination ekle.
**Dosya:** `src/scripts/gallery-page.js` (yeni dosya)
**Yapılacak değişiklik:**
```js
const PAGE_SIZE = 12;
let currentPage = 0;
let hasMore = true;
let isLoading = false;

async function loadMoreGalleryItems() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  
  const from = currentPage * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) { isLoading = false; return; }
  
  if (data.length < PAGE_SIZE) hasMore = false;
  galleryItems.push(...data);
  currentPage++;
  renderGalleryPage();
  isLoading = false;
}

// IntersectionObserver ile sentinel element
function initInfiniteScroll() {
  const sentinel = document.createElement('div');
  sentinel.id = 'gallery-sentinel';
  sentinel.style.height = '1px';
  document.getElementById('gallery-page-grid').after(sentinel);
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMoreGalleryItems();
  }, { rootMargin: '200px' });
  
  observer.observe(sentinel);
}
```

---

### FEATURE-04: Admin Panel — Toplu Görsel Kategori Değiştirme (Bulk Edit)
**Hedef:** Admin listede birden fazla görseli seçip toplu kategori/albüm değiştirme.
**Dosya:** `admin/index.html`
**Yapılacak değişiklik:** Galeri listesi item'larına checkbox ekle:
```js
// gallery-list__item template:
`<div class="gallery-list__item" data-id="${item.id}">
  <input type="checkbox" class="gallery-select-cb" data-id="${item.id}" 
    onchange="window.updateBulkSelection()" 
    style="width:18px;height:18px;cursor:pointer;flex-shrink:0;" />
  <img class="gallery-list__thumb" src="${item.url}" ... />
  ...
</div>`

// Bulk action bar:
function renderBulkActionBar(count) {
  const existing = document.getElementById('bulk-action-bar');
  if (existing) existing.remove();
  if (count === 0) return;
  
  const bar = document.createElement('div');
  bar.id = 'bulk-action-bar';
  bar.style.cssText = 'position:sticky;top:72px;z-index:50;background:var(--brand-600);color:#fff;padding:0.75rem 1rem;display:flex;align-items:center;gap:1rem;border-radius:var(--radius-sm);margin-bottom:1rem;';
  bar.innerHTML = `
    <span>${count} görsel seçildi</span>
    <select id="bulk-category" style="padding:0.4rem;border-radius:6px;border:none;">
      <option value="">Kategori Seç</option>
      <option value="etkinlik">Etkinlik</option>
      <option value="toplanti">Toplantı</option>
      <option value="egitim">Eğitim</option>
      <option value="diger">Diğer</option>
    </select>
    <input id="bulk-album" placeholder="Albüm adı" style="padding:0.4rem;border-radius:6px;border:none;width:150px;">
    <button onclick="window.applyBulkEdit()" class="btn" style="background:#fff;color:var(--brand-700);">Uygula</button>
    <button onclick="window.cancelBulkSelection()" class="btn" style="background:rgba(255,255,255,0.2);color:#fff;">İptal</button>
  `;
  document.getElementById('gallery-manager-list').before(bar);
}

window.updateBulkSelection = function() {
  const checked = document.querySelectorAll('.gallery-select-cb:checked');
  renderBulkActionBar(checked.length);
};

window.applyBulkEdit = async function() {
  const ids = [...document.querySelectorAll('.gallery-select-cb:checked')].map(cb => cb.dataset.id);
  const category = document.getElementById('bulk-category').value;
  const album = document.getElementById('bulk-album').value.trim();
  if (!ids.length) return;
  
  const updates = {};
  if (category) updates.category = category;
  if (album) updates.album_id = album;
  if (!Object.keys(updates).length) { showToast('Kategori veya albüm seçin.', 'info'); return; }
  
  try {
    const { error } = await supabase.from('gallery_items').update(updates).in('id', ids);
    if (error) throw error;
    showToast(`${ids.length} görsel güncellendi.`, 'success');
    window.cancelBulkSelection();
    loadGalleryManagement();
  } catch (e) {
    showToast('Güncelleme hatası: ' + e.message, 'error');
  }
};

window.cancelBulkSelection = function() {
  document.querySelectorAll('.gallery-select-cb').forEach(cb => cb.checked = false);
  const bar = document.getElementById('bulk-action-bar');
  if (bar) bar.remove();
};
```
**Supabase import ekle** `admin/index.html` başında:
```js
import { supabase } from '../src/supabase/config.js';
```

---

### FEATURE-05: Galeri Sayfası — URL Hash ile Doğrudan Görsel Linki
**Hedef:** `kirshehirgormeengelliler.org.tr/galeri#gorsel-42` şeklinde direkt link paylaşımı.
**Dosya:** `src/scripts/gallery-page.js`
**Yapılacak değişiklik:**
```js
// initGallery() sonunda:
function handleGalleryHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.replace('#gorsel-', '');
  if (!id) return;
  const item = galleryItems.find(i => String(i.id) === id);
  if (item) {
    setTimeout(() => window.openLightbox(String(item.id), item.album_id || ''), 300);
  }
}

// openLightbox'da hash güncelle:
window.openLightbox = function(id, albumContext) {
  // ... mevcut kod
  history.replaceState(null, '', `#gorsel-${id}`);
};

window.closeLightbox = function() {
  // ... mevcut kod
  history.replaceState(null, '', window.location.pathname);
};

// Sayfa yüklendiğinde hash kontrolü:
handleGalleryHash();
window.addEventListener('popstate', handleGalleryHash);
```

---

### FEATURE-06: Admin Panel — Sürükle-Bırak ile Görsel Sıralama (Drag & Drop Reorder)
**Hedef:** Admin galeri listesinde görsellerin sırasını sürükle-bırak ile değiştir, Supabase'e kaydet.
**Dosya:** `admin/index.html` — `renderAdminGalleryList()` ve yeni fonksiyon
**Yapılacak değişiklik:**
```js
// renderAdminGalleryList() içinde her item'a:
`<div class="gallery-list__item" data-id="${item.id}" draggable="true">
  <div style="cursor:grab;padding:0 0.5rem;color:var(--text-faint);">⠿</div>
  ...
</div>`

// Sonrasında drag event'leri bağla:
function initGalleryDragSort() {
  const list = document.getElementById('gallery-manager-list');
  if (!list) return;
  
  let draggedEl = null;
  
  list.addEventListener('dragstart', (e) => {
    draggedEl = e.target.closest('.gallery-list__item');
    if (!draggedEl) return;
    draggedEl.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  });
  
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('.gallery-list__item');
    if (!target || target === draggedEl) return;
    const rect = target.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    target.style.borderTop = e.clientY < mid ? '2px solid var(--brand-500)' : '';
    target.style.borderBottom = e.clientY >= mid ? '2px solid var(--brand-500)' : '';
  });
  
  list.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.gallery-list__item');
    if (target) { target.style.borderTop = ''; target.style.borderBottom = ''; }
  });
  
  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    const target = e.target.closest('.gallery-list__item');
    if (!target || !draggedEl || target === draggedEl) return;
    target.style.borderTop = ''; target.style.borderBottom = '';
    
    // DOM reorder
    const parent = target.parentElement;
    const rect = target.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      parent.insertBefore(draggedEl, target);
    } else {
      parent.insertBefore(draggedEl, target.nextSibling);
    }
    
    // Yeni sırayı DB'ye kaydet
    const items = [...list.querySelectorAll('.gallery-list__item')];
    const updates = items.map((el, idx) => ({ id: el.dataset.id, order: idx }));
    
    try {
      // Supabase upsert with order
      for (const { id, order } of updates) {
        await supabase.from('gallery_items').update({ order }).eq('id', id);
      }
      showToast('Sıralama kaydedildi.', 'success');
    } catch (err) {
      showToast('Sıralama kaydedilemedi: ' + err.message, 'error');
    }
  });
  
  list.addEventListener('dragend', () => {
    if (draggedEl) draggedEl.style.opacity = '1';
    draggedEl = null;
    list.querySelectorAll('.gallery-list__item').forEach(el => {
      el.style.borderTop = ''; el.style.borderBottom = '';
    });
  });
}
```
**`updateGalleryItemOrder()` fonksiyonu** `src/supabase/gallery.js`'de zaten tanımlı — bunu kullan.

---

### FEATURE-07: Site Geneli — Arama Fonksiyonu (Galeri + İçerik Arama)
**Hedef:** Header'a arama ikonu ekle, galeri ve sayfa içeriklerinde arama yap.
**Yeni dosya oluştur:** `src/scripts/search.js`
```js
export function initSearch() {
  // Arama modal'ı oluştur
  const modal = document.createElement('div');
  modal.id = 'search-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Site araması');
  modal.style.cssText = `
    position:fixed;inset:0;z-index:2000;
    background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);
    display:none;align-items:flex-start;justify-content:center;
    padding-top:15vh;
  `;
  modal.innerHTML = `
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);width:min(640px,90vw);box-shadow:var(--shadow-xl);overflow:hidden;">
      <div style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;border-bottom:1px solid var(--color-border);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="search-input" type="search" placeholder="Aramak istediğinizi yazın..." 
          style="flex:1;border:none;outline:none;font-size:1.125rem;background:transparent;color:var(--color-text);" 
          autocomplete="off" />
        <kbd style="font-size:0.75rem;padding:2px 8px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px;">Esc</kbd>
      </div>
      <div id="search-results" style="max-height:400px;overflow-y:auto;padding:0.5rem;"></div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Keyboard shortcut: Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && modal.style.display === 'flex') closeSearch();
  });
  
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSearch(); });
  
  const input = document.getElementById('search-input');
  input.addEventListener('input', debounce(performSearch, 300));
  
  function openSearch() {
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 50);
  }
  
  function closeSearch() {
    modal.style.display = 'none';
    input.value = '';
    document.getElementById('search-results').innerHTML = '';
  }
  
  async function performSearch() {
    const query = input.value.trim();
    const results = document.getElementById('search-results');
    if (query.length < 2) { results.innerHTML = '<p style="padding:1rem;color:var(--color-text-muted);text-align:center;">En az 2 karakter girin...</p>'; return; }
    
    results.innerHTML = '<p style="padding:1rem;text-align:center;">Aranıyor...</p>';
    
    try {
      const { data } = await supabase
        .from('gallery_items')
        .select('id, caption, category, url')
        .ilike('caption', `%${query}%`)
        .limit(10);
      
      if (!data || data.length === 0) {
        results.innerHTML = '<p style="padding:1rem;color:var(--color-text-muted);text-align:center;">Sonuç bulunamadı.</p>';
        return;
      }
      
      results.innerHTML = data.map(item => `
        <a href="/galeri#gorsel-${item.id}" onclick="closeSearch()" 
          style="display:flex;align-items:center;gap:1rem;padding:0.75rem;border-radius:var(--radius-md);text-decoration:none;color:var(--color-text);transition:background 150ms;"
          onmouseover="this.style.background='var(--color-surface)'" onmouseout="this.style.background=''">
          <img src="${item.url}" style="width:48px;height:48px;border-radius:var(--radius-md);object-fit:cover;" alt="" />
          <div>
            <p style="font-weight:600;margin:0;">${item.caption || 'Açıklamasız'}</p>
            <p style="font-size:0.8rem;color:var(--color-text-muted);margin:0;">${item.category || 'Galeri'}</p>
          </div>
        </a>
      `).join('');
    } catch (err) {
      results.innerHTML = '<p style="padding:1rem;color:var(--color-error-text);">Arama sırasında hata oluştu.</p>';
    }
  }
  
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;
  
  return { openSearch, closeSearch };
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
```
**`src/scripts/main.js`'e ekle:**
```js
import { initSearch } from './search.js';
// DOMContentLoaded içinde:
initSearch();
```
**`site-renderer.js` — renderHeader() içine arama butonu ekle:**
```js
// header actions arasına:
`<button id="search-toggle" onclick="window.openSearch()" aria-label="Ara (Ctrl+K)" title="Ara" style="...">
  <svg ...>[arama ikonu]</svg>
</button>`
```

---

### FEATURE-08: Admin Panel — Etkinlik Takvimi Modülü
**Hedef:** Supabase'de `events` tablosu üzerinden etkinlik oluştur/listele/sil.
**Yeni Supabase tablosu** (SQL):
```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  location text,
  category text DEFAULT 'etkinlik',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON events FOR SELECT USING (is_public = true);
CREATE POLICY "Admin write" ON events FOR ALL USING (auth.role() = 'authenticated');
```
**Yeni dosya:** `src/supabase/events.js`
```js
import { supabase } from './config.js';

export async function getUpcomingEvents(limit = 10) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addEvent(event) {
  const { data, error } = await supabase.from('events').insert([event]);
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
```
**Admin panele yeni tab ekle:** Sidebar'a "Etkinlikler" nav-item ekle ve `renderSectionView('events')` için handler yaz.

---

### FEATURE-09: PWA — Offline Galeri Önbelleği (Service Worker Güncelleme)
**Hedef:** Mevcut `sw.js` yoksa oluştur, galeri görselleri önbelleklenir, offline görüntülenebilir.
**Yeni dosya:** `public/sw.js`
```js
const CACHE_NAME = 'kged-v1';
const STATIC_ASSETS = ['/', '/hakkimizda', '/galeri', '/iletisim', '/tuzuk'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Supabase storage görselleri — cache-first
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
    e.respondWith(
      caches.open('kged-images').then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const response = await fetch(e.request);
        if (response.ok) cache.put(e.request, response.clone());
        return response;
      }).catch(() => new Response('', { status: 503 }))
    );
    return;
  }
  
  // HTML sayfaları — network-first
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }
  
  // Statik assets — stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
```

---

### FEATURE-10: Erişilebilirlik — Otomatik Alt Text Üretimi (Claude AI Entegrasyonu)
**Hedef:** Görsel yüklenirken alt text yoksa Claude API ile otomatik Türkçe alt text üret.
**Yeni dosya:** `src/utils/generate-alt-text.js`
```js
/**
 * Görsel için Claude API kullanarak Türkçe alt text üretir.
 * Sadece admin panelinde kullanılır.
 * @param {Blob} imageBlob
 * @returns {Promise<string>}
 */
export async function generateAltText(imageBlob) {
  // Base64'e çevir
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(imageBlob);
  });
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageBlob.type || 'image/jpeg', data: base64 }
            },
            {
              type: 'text',
              text: 'Bu görseli Türkçe olarak kısaca açıkla. Sadece açıklama metni yaz, başka bir şey yazma. Maksimum 2 cümle.'
            }
          ]
        }]
      })
    });
    
    if (!response.ok) return '';
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || '';
  } catch {
    return '';
  }
}
```
**Admin panelde kullan:** `handleImageAdd()` içinde, `alt_text` boşsa:
```js
const altText = document.getElementById('upload-alt').value.trim();
const finalAlt = altText || await generateAltText(compressed).catch(() => '');
```
> **Not:** Bu özellik için Anthropic API key'i admin panelinde bir konfigürasyon alanından alınmalı veya Supabase Edge Function üzerinden proxy'lenmeli.

---

### FEATURE-11: Analitik Dashboard — Admin Paneli Ziyaretçi ve İçerik İstatistikleri
**Hedef:** Admin dashboard'a gerçek istatistikler ekle.
**Yeni Supabase tablosu:**
```sql
CREATE TABLE page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  user_agent text,
  country text
);
CREATE INDEX ON page_views (page, viewed_at);
```
**Yeni dosya:** `src/scripts/analytics.js`
```js
import { supabase } from '../supabase/config.js';

export async function trackPageView(page) {
  // Sadece prod'da çalış
  if (import.meta.env.DEV) return;
  await supabase.from('page_views').insert([{
    page,
    user_agent: navigator.userAgent.substring(0, 200)
  }]).catch(() => {}); // Sessiz başarısızlık
}

export async function getPageViewStats(days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('page_views')
    .select('page, viewed_at')
    .gte('viewed_at', since);
  return data || [];
}
```
**`src/scripts/main.js`'e ekle:**
```js
import { trackPageView } from './analytics.js';
// initHydration() sonrasında:
trackPageView(window.location.pathname);
```
**Admin dashboard'da istatistik göster** — `renderDashboardHome()` içinde async olarak çek.

---

### FEATURE-12: Gelişmiş Form Doğrulama ve İletişim Formu
**Hedef:** İletişim sayfasına gerçek bir form ekle, Supabase'e kaydet, e-posta gönder.
**Yeni Supabase tablosu:**
```sql
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
**`site-renderer.js` — `renderContactContent()` içine form ekle:**
```html
<section class="section section--alt">
  <div class="container" style="max-width:640px;margin-inline:auto;">
    <h2 class="section__title">Mesaj Gönderin</h2>
    <div id="contact-form-wrapper">
      <!-- Form alanları -->
      <div class="field-group">
        <label>Ad Soyad *</label>
        <input id="cf-name" type="text" required placeholder="Adınız Soyadınız" />
      </div>
      <div class="field-group">
        <label>E-posta *</label>
        <input id="cf-email" type="email" required />
      </div>
      <div class="field-group">
        <label>Mesajınız *</label>
        <textarea id="cf-message" rows="5" required></textarea>
      </div>
      <button id="cf-submit" class="btn btn--primary btn--lg" style="width:100%;">Gönder</button>
      <div id="cf-status" role="alert" aria-live="polite"></div>
    </div>
  </div>
</section>
```
**Yeni dosya:** `src/supabase/contact.js`
```js
import { supabase } from './config.js';

export async function submitContactMessage(data) {
  const { error } = await supabase.from('contact_messages').insert([data]);
  if (error) throw error;
}
```
**Admin panele "Mesajlar" tab'ı ekle** — okunmamış mesaj sayısını badge olarak göster.

---

## 📋 ÖZET CHECKLIST

### Kritik Buglar (Hemen Düzeltilmeli)
- [ ] BUG-01: Supabase key'ini kaynak koddan kaldır
- [ ] BUG-02: Galeri hata durumunda retry UI göster
- [ ] BUG-03: Filter sonrası IntersectionObserver yeniden başlat
- [ ] BUG-04: `order` reserved keyword sorununu çöz
- [ ] BUG-05: Admin `stat-gallery` null ref güvenliğini sağla
- [ ] BUG-06: `sanitizePath` boş string güvencesi ekle
- [ ] BUG-07: Board kaydet butonunu renderBoardUI'ya ekle
- [ ] BUG-08: Lightbox albüm konteksti sorunu düzelt
- [ ] BUG-09: addGalleryItem schema error detection iyileştir
- [ ] BUG-10: Silme butonunu disable et / UX iyileştir

### Önemli İyileştirmeler
- [ ] FIX-01: Filter + albüm toggle event delegation
- [ ] FIX-02: SaveConfig'te phoneHref/emailHref türet
- [ ] FIX-03: getSiteConfig null log
- [ ] FIX-04: Queue duplicate kontrolü
- [ ] FIX-05: switchTab null siteContent guard
- [ ] FIX-06: CSP'ye wss:// ekle
- [ ] FIX-07: WebP MIME type uyumu
- [ ] FIX-08: Lightbox touch swipe
- [ ] FIX-09: Gallery inline script → ayrı dosya
- [ ] FIX-10: escapeHtml shared utility
- [ ] FIX-11: Admin tema toggle meta tag
- [ ] FIX-12: Admin CSS split kontrolü

### İleri Düzey Özellikler
- [ ] FEATURE-01: Supabase Realtime galeri güncellemeleri
- [ ] FEATURE-02: WebP görsel dönüşümü
- [ ] FEATURE-03: Infinite scroll pagination
- [ ] FEATURE-04: Toplu görsel düzenleme (Bulk Edit)
- [ ] FEATURE-05: URL hash ile görsel linkleme
- [ ] FEATURE-06: Drag & Drop görsel sıralama
- [ ] FEATURE-07: Site geneli arama (Ctrl+K)
- [ ] FEATURE-08: Etkinlik takvimi modülü
- [ ] FEATURE-09: PWA offline önbellek güncelleme
- [ ] FEATURE-10: Claude AI ile otomatik alt text
- [ ] FEATURE-11: Analitik dashboard
- [ ] FEATURE-12: İletişim formu modülü

---

*Bu dosya KGED web projesi için AI ajan tarafından 2026-04-08 tarihinde üretilmiştir.*
*Toplam: 10 kritik bug, 12 iyileştirme, 12 ileri düzey özellik.*
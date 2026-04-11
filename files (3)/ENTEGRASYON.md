# Link Preview Entegrasyon Rehberi

## Dosyaları Nereye Koy

```
proje-kök/
├── api/
│   └── fetch-preview.js          ← YENİ (CORS proxy)
├── duyurular/
│   └── detay/
│       └── index.html            ← YENİ (detay shell)
├── src/
│   └── scripts/
│       └── announcement-detail.js ← YENİ (detay JS)
│       └── admin-link-preview.js  ← YENİ (admin snippet)
└── vercel.json                    ← GÜNCELLE (rewrite + CSP)
```

---

## 1 · vercel.json — Mevcut Dosyayı Değiştir

Yeni `vercel.json` dosyasını kök dizindekiyle değiştir.  
Eklenenler:
- `"rewrites"` bloğu → `/duyurular/:slug` → `/duyurular/detay`
- CSP'ye `cdnjs.cloudflare.com` ve `*.supabase.co` eklendi

---

## 2 · vite.config.js — rollupOptions'a entry ekle

```js
// vite.config.js içinde build.rollupOptions.input'a:
detay: resolve(__dirname, 'duyurular/detay/index.html'),
```

Tam blok:
```js
rollupOptions: {
  input: {
    main:       resolve(__dirname, 'index.html'),
    hakkimizda: resolve(__dirname, 'hakkimizda/index.html'),
    galeri:     resolve(__dirname, 'galeri/index.html'),
    tuzuk:      resolve(__dirname, 'tuzuk/index.html'),
    iletisim:   resolve(__dirname, 'iletisim/index.html'),
    duyurular:  resolve(__dirname, 'duyurular/index.html'),
    detay:      resolve(__dirname, 'duyurular/detay/index.html'), // ← EKLE
    notfound:   resolve(__dirname, '404.html'),
  },
},
```

---

## 3 · Admin Panele Link Preview Entegrasyonu

Admin panelinde duyuru kartı render eden fonksiyonu bul  
(genellikle `renderAnnouncementCard`, `renderAnnCard` veya `buildAnnHtml` gibi bir isim).

### 3a — Import ekle (dosyanın en üstüne)

```js
import {
  renderLinkPreviewBlock,
  initLinkPreview,
  getLinkPreviewData,
} from '../src/scripts/admin-link-preview.js';
```

### 3b — Form HTML'ine blok ekle

Duyuru formunun sonuna (kaydet butonundan önce) şunu ekle:

```js
// Örnek — mevcut form build kodunun içinde:
formHtml += renderLinkPreviewBlock(ann.id, ann.linkPreview ?? null);
```

### 3c — Kart render edildikten SONRA init çağır

```js
// innerHTML atandıktan hemen sonra:
document.getElementById(`ann-card-${ann.id}`).innerHTML = formHtml;
initLinkPreview(ann.id, ann.linkPreview ?? null);
```

### 3d — Kaydetmede preview datasını al

```js
// saveAnnouncements() içinde her duyuru için:
announcements = announcements.map(ann => ({
  ...ann,
  linkPreview: getLinkPreviewData(ann.id) ?? ann.linkPreview ?? null,
}));
// sonra supabase'e kaydet...
```

---

## 4 · Duyuru Listesi Sayfası — Kart Linki

Duyuru listesindeki her kart `href="/duyurular/${slugify(ann.title)}"` ile link olmalı.

Eğer `ann.linkPreview` varsa bile detay sayfasına git — orası zaten
yönlendirmeyi halleder (kullanıcıya "yönlendiriliyorsunuz" gösterir ve 0.8s sonra gider).

```js
// renderAnnouncementCard() içinde:
const detailUrl = `/duyurular/${slugify(ann.title)}`;

return `<a href="${detailUrl}" class="ann-card">
  ...
</a>`;
```

---

## 5 · Akış Özeti

```
Admin URL girer
    ↓
"Önizle" butonuna basar
    ↓
/api/fetch-preview?url=... çağrılır  (Vercel serverless — CORS yok)
    ↓
og:title, og:description, og:image parse edilir
    ↓
Önizleme kartı admin'de gösterilir
    ↓
Admin "Kaydet" e basar → { linkPreview: { url, title, image, ... } } Supabase'e kaydedilir
    ↓
Kullanıcı sitede duyuruya tıklar → /duyurular/ofis
    ↓
vercel.json rewrite → /duyurular/detay serve edilir
    ↓
announcement-detail.js çalışır → slug = "ofis"
    ↓
getSiteConfig() → ann.linkPreview.url var mı?
  EVET → window.open(linkPreview.url) + bu sayfa /duyurular'a döner
  HAYIR → içeriği sayfada göster
```

---

## Sık Karşılaşılan Sorunlar

| Sorun | Neden | Çözüm |
|-------|-------|-------|
| `/api/fetch-preview` 404 döndürüyor | `api/` klasörü yok veya deploy edilmedi | Klasörün kök dizinde olduğundan emin ol, `vercel deploy` yap |
| Önizleme çalışıyor ama görsel gelmiyor | Bazı siteler `og:image` koymaz | Normal — görsel alanı gizleniyor, başlık/açıklama gösteriliyor |
| Haber sitesi fetch'i reddediyor | Bazı siteler bot engeli koyar | Fallback çalışır: URL kaydedilir, kullanıcı direkt yönlendirilir |
| `/duyurular/ofis` hâlâ 404 | `rewrites` vercel.json'a eklenmedi veya deploy edilmedi | `vercel.json`'ı güncelle ve `vercel deploy` ile yeniden deploy et |
| DOMPurify CSP hatası | CSP'ye `cdnjs.cloudflare.com` eklenmedi | Yeni `vercel.json`'ı kullan |

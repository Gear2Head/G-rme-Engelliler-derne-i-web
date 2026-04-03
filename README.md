# Kırşehir Görme Engelliler Derneği — Web Sitesi

Resmi web sitesi için Vite tabanlı, çok sayfalı, erişilebilirlik odaklı statik site.

## Teknoloji

- **Vite** — Build aracı, geliştirme sunucusu
- **Vanilla HTML/CSS/JS** — Framework yok, dependency light
- **Vanilla CSS** — Custom properties ile tasarım sistemi
- **Vercel** — Hosting

## Kurulum

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # dist/ klasörüne üretim build
npm run preview  # Üretim build önizlemesi
```

## Dosya Yapısı

```
├── index.html              Ana sayfa
├── hakkimizda/index.html   Hakkımızda sayfası
├── tuzuk/index.html        Tüzük sayfası
├── iletisim/index.html     İletişim sayfası
├── 404.html                Özel 404 sayfası
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── src/
│   ├── data/
│   │   └── site-content.json   → Tüm içerik buradan yönetilir
│   ├── styles/
│   │   ├── tokens.css          → Tasarım token'ları (renkler, fontlar, spacing)
│   │   ├── reset.css           → CSS normalize
│   │   ├── components.css      → Buton, kart, alert, vs.
│   │   ├── layout.css          → Header, footer, loader, toolbar
│   │   └── main.css            → Import noktası
│   └── scripts/
│       ├── main.js             → Giriş noktası
│       ├── theme.js            → Tema yönetimi
│       ├── toolbar.js          → Erişilebilirlik araç çubuğu
│       ├── loader.js           → Yükleme animasyonu
│       └── nav.js              → Navigasyon
└── vercel.json             → Güvenlik header'ları, yönlendirme
```

## İçerik Güncelleme

**Tüm içerik `src/data/site-content.json` dosyasından yönetilir.**

### Telefon/E-posta değiştirme:
`contact.phone` ve `contact.email` alanlarını güncelleyin.

### Adres onaylandığında:
1. `contact.address.full` alanını doldurun
2. `contact.status.hasAddress` → `true` yapın
3. `contact.geo.lat` ve `contact.geo.lng` koordinatlarını ekleyin
4. `contact.status.hasGeoCoordinates` → `true` yapın

### Haritayı aktifleştirmek için:
`iletisim/index.html` dosyasında `.map-placeholder` bölümünü Google Maps `<iframe>` ile değiştirin.

### Tüzük belgesi geldiğinde:
1. PDF'yi `public/belgeler/tuzuk.pdf` olarak ekleyin
2. `tuzuk/index.html` dosyasındaki yorum satırlarını kaldırın (`<!-- ... -->`)

### Logo geldiğinde:
Logo SVG/PNG dosyasını `public/` klasörüne ekleyin. Header'daki `.header__logo-icon` bölümünü `<img>` ile değiştirin.

## Erişilebilirlik Araç Çubuğu

Sağ tarafta sabit araç çubuğu şunları destekler:
- **Yazı boyutu**: %100 → %200 (5 adım)
- **Karanlık mod**: Sistem tercihini override eder
- **Yüksek kontrast**: Siyah zemin, sarı metin
- **Gri ton**: `filter: grayscale(100%)`
- **Disleksi dostu font**: OpenDyslexic benzeri
- Tüm tercihler `localStorage`'da saklanır

## Deploy (Vercel)

Vercel hesabınızdan bu repoyu import edin. Framework otomatik algılanır (Vite). `vercel.json` güvenlik header'larını otomatik uygular.

## Lighthouse Hedefleri

| Metrik | Hedef |
|--------|-------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| SEO | ≥ 95 |
| WCAG | 2.1 AA (AAA hedef) |

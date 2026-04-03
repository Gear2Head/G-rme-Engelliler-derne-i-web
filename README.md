# Kırşehir Görme Engelliler Derneği Web Sitesi

Vite tabanlı, çok sayfalı ve erişilebilirlik odaklı statik site.

## Teknoloji

- `Vite`
- `Vanilla HTML/CSS/JS`
- `Vanilla CSS custom properties`
- `Vercel`

## Kurulum

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Mimari

- Kök HTML dosyaları artık son çıktı değil, build-time template girişleridir.
- Gerçek sayfa HTML'i `vite.config.js` içindeki içerik renderer katmanı tarafından üretilir.
- Tüm metinler, iletişim bilgileri, SEO alanları ve durum mesajları `src/data/site-content.json` dosyasından gelir.
- Ortak şablon mantığı `src/build/site-renderer.js` içindedir.

## Dizin Yapısı

```text
├── index.html
├── hakkimizda/index.html
├── tuzuk/index.html
├── iletisim/index.html
├── 404.html
├── public/
├── src/
│   ├── build/
│   │   └── site-renderer.js
│   ├── data/
│   │   └── site-content.json
│   ├── scripts/
│   └── styles/
├── vercel.json
└── vite.config.js
```

## İçerik Güncelleme

Tüm içerik `src/data/site-content.json` üzerinden yönetilir.

### Telefon ve e-posta

- `contact.phone`
- `contact.phoneHref`
- `contact.email`
- `contact.emailHref`

### Adres ve harita

- Adres gösterimi için `site.status.hasAddress` alanı `true` olmalı.
- Tam adres için `contact.address.full` ve kısa adres için `contact.address.short` kullanılır.
- Google Haritalar yön linki için `contact.googleMapsUrl` kullanılır.
- Gömülü haritayı açmak için:
  - `site.status.hasGeoCoordinates` alanını `true` yapın
  - `site.status.hasMapsEmbed` alanını `true` yapın
  - `contact.geo.lat` ve `contact.geo.lng` değerlerini girin

### Tüzük

- Tüzük dosyası geldiğinde PDF'yi `public/` altına ekleyin.
- Ardından `constitution.pdfPath` alanını güncelleyin.
- Tüzük indirme alanı yalnızca `site.status.hasConstitution = true` ise görünür.

### Logo ve sosyal görsel

- Logo için dosyayı `public/` altına ekleyin ve `site.logoPath` alanını doldurun.
- Logo yalnızca `site.status.hasLogo = true` ise render edilir.
- Open Graph görseli için `site.ogImagePath` kullanılabilir.
- Apple touch icon gerekiyorsa `site.appleTouchIconPath` alanını doldurun.

## Notlar

- Runtime JavaScript yalnızca davranış katmanıdır: tema, toolbar, loader ve navigasyon.
- İçerik istemci tarafında fetch edilmez; build sırasında HTML içine gömülür.
- `dist/` çıktısı JavaScript olmadan da temel içerik ve SEO meta verilerini içerir.

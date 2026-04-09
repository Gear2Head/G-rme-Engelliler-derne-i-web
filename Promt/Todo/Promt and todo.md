# ✅ TODO.md — Dernek Web Sitesi Geliştirme Planı

> **Proje:** Profesyonel Dernek Web Sitesi  
> **Tahmini Süre:** 10-14 hafta  
> **Öncelik:** 🔴 Kritik / 🟡 Yüksek / 🟢 Normal / 🔵 Opsiyonel

---

## FAZA 0 — Proje Kurulumu & Altyapı
**Tahmini süre: 3-5 gün**

- [ ] 🔴 Proje dizin yapısını oluştur (Next.js 14 init)
- [ ] 🔴 Git repository oluştur, `.gitignore` ve `README.md` ekle
- [ ] 🔴 Tailwind CSS konfigürasyonunu yap (renk paleti, font, spacing)
- [ ] 🔴 TypeScript konfigürasyonunu ayarla (`tsconfig.json`)
- [ ] 🔴 ESLint + Prettier konfigürasyonu
- [ ] 🔴 Ortam değişkenleri dosyalarını oluştur (`.env.local`, `.env.example`)
- [ ] 🔴 PostgreSQL veritabanını kur ve Prisma'yı başlat
- [ ] 🔴 Prisma şemasını yaz (tüm tablolar)
- [ ] 🔴 İlk migration'ı çalıştır
- [ ] 🔴 Seed verisi hazırla (demo içerik)
- [ ] 🟡 Redis kurulumu (session + cache)
- [ ] 🟡 GitHub Actions CI/CD pipeline'ı oluştur
- [ ] 🟢 Sentry entegrasyonu
- [ ] 🟢 Google Analytics 4 kurulumu

---

## FAZA 1 — Temel Layout & Navigasyon
**Tahmini süre: 5-7 gün**

### Header
- [ ] 🔴 Top Bar bileşeni (tel, whatsapp, dil seçimi, sosyal ikonlar)
- [ ] 🔴 Logo bileşeni (responsive)
- [ ] 🔴 Ana navigasyon menüsü — desktop (dropdown desteği)
- [ ] 🔴 Mobil hamburger menü (slide-in animasyonu)
- [ ] 🔴 Sticky header (scroll davranışı)
- [ ] 🔴 Üyelik Başvurusu butonu
- [ ] 🔴 Üye Girişi modal trigger butonu
- [ ] 🔴 Bağış Yap butonu (vurgulu renk)
- [ ] 🟡 Arama çubuğu (expand animasyonu)

### Footer
- [ ] 🔴 4 kolonlu footer layout
- [ ] 🔴 İletişim bilgileri kolonu
- [ ] 🔴 Kurumsal linkler kolonu
- [ ] 🔴 Multimedya linkler kolonu
- [ ] 🔴 Sosyal medya ikonları
- [ ] 🔴 E-posta abonelik formu (footer'da)
- [ ] 🟡 Ziyaretçi sayacı
- [ ] 🟢 Site haritası linki
- [ ] 🟢 Copyright ve telif satırı

### Genel
- [ ] 🔴 404 Sayfası tasarımı
- [ ] 🔴 Loading skeleton bileşenleri
- [ ] 🔴 Toast/notification sistemi
- [ ] 🟡 Cookie consent banner (KVKK)
- [ ] 🟡 Scroll to top butonu

---

## FAZA 2 — Anasayfa
**Tahmini süre: 5-7 gün**

- [ ] 🔴 Hero Slider (Swiper.js, otomatik geçiş, touch desteği)
- [ ] 🔴 Slider dot indikatörleri ve ok navigasyonu
- [ ] 🔴 Hızlı haber ticker (yatay kayan)
- [ ] 🔴 Başkan fotoğrafı widget (sol panel)
- [ ] 🔴 Haberler / Duyurular / Faaliyetler / Basında Biz tab sistemi
- [ ] 🔴 Kısayollar bölümü (4 kart)
- [ ] 🔴 Hakkımızda özet bölümü
- [ ] 🔴 İstatistik sayaçları (count-up animasyonu)
- [ ] 🔴 Foto Galeriler önizleme (3 kart)
- [ ] 🔴 Videolar önizleme
- [ ] 🔴 Sponsorlar kaydırmalı slider
- [ ] 🟡 Animasyonlar (Framer Motion — scroll reveal)
- [ ] 🟢 Yaklaşan etkinlik banner

---

## FAZA 3 — İçerik Sayfaları
**Tahmini süre: 7-10 gün**

### Haberler & Duyurular
- [ ] 🔴 Haberler liste sayfası (3 kolon grid)
- [ ] 🔴 Haber detay sayfası (slug bazlı)
- [ ] 🔴 Duyurular liste sayfası
- [ ] 🔴 Duyuru detay sayfası
- [ ] 🔴 Basında Biz sayfası
- [ ] 🟡 Kategori filtreleme
- [ ] 🟡 Arama fonksiyonu
- [ ] 🟡 Sayfalama (pagination)
- [ ] 🟢 Sosyal paylaşım butonları (haber detayda)
- [ ] 🟢 İlgili haberler bölümü

### Etkinlikler
- [ ] 🔴 Etkinlikler liste sayfası
- [ ] 🔴 Etkinlik detay sayfası
- [ ] 🔴 Google Maps embed
- [ ] 🟡 Takvim görünümü toggle
- [ ] 🟡 Etkinlik filtreleme (tarih, kategori)
- [ ] 🟡 Webinarlar sayfası
- [ ] 🔵 Etkinlik katılım formu

### Kurumsal
- [ ] 🔴 Hakkımızda sayfası
- [ ] 🔴 Yönetim Kurulu sayfası (kart grid)
- [ ] 🔴 Dernek Tüzüğü sayfası (PDF viewer)
- [ ] 🔴 Misyon & Vizyon sayfası
- [ ] 🟡 Üye Listesi sayfası (arama + filtre)

### Multimedya
- [ ] 🔴 Foto Galeriler liste sayfası
- [ ] 🔴 Galeri detay sayfası
- [ ] 🔴 Lightbox (yet-another-react-lightbox)
- [ ] 🔴 Videolar sayfası (YouTube/Vimeo embed)
- [ ] 🟡 Video modal oynatıcı
- [ ] 🟢 Masonry grid layout (galeriler)

---

## FAZA 4 — Üyelik & Auth Sistemi
**Tahmini süre: 7-10 gün**

- [ ] 🔴 Üyelik başvuru formu (çok adımlı — stepper)
  - [ ] 🔴 1. Adım: Kişisel bilgiler
  - [ ] 🔴 2. Adım: İletişim ve adres
  - [ ] 🔴 3. Adım: Fotoğraf yükleme
  - [ ] 🔴 4. Adım: Onay ve KVKK
- [ ] 🔴 Form validasyonu (Zod şeması)
- [ ] 🔴 TC Kimlik No validasyonu (algoritma)
- [ ] 🔴 İl/İlçe dropdown (Türkiye il-ilçe verisi)
- [ ] 🔴 Üye girişi modal
- [ ] 🔴 JWT token yönetimi (httpOnly cookie)
- [ ] 🔴 Şifremi unuttum akışı
  - [ ] 🔴 E-posta ile sıfırlama
  - [ ] 🟡 SMS ile sıfırlama
- [ ] 🔴 Üye paneli (temel bilgiler)
- [ ] 🟡 Profil güncelleme formu
- [ ] 🟡 Şifre değiştirme
- [ ] 🟡 Etkinlik kayıtları görüntüleme
- [ ] 🟢 Mesaj kutusu (yönetimle iletişim)

---

## FAZA 5 — Aidat & Bağış Modülleri
**Tahmini süre: 5-7 gün**

### Aidat Sorgulama
- [ ] 🔴 Aidat sorgulama sayfası UI
- [ ] 🔴 TC No / Üye No girişi
- [ ] 🔴 CAPTCHA (güvenlik kodu)
- [ ] 🔴 Aidat durumu sonuç ekranı
- [ ] 🟡 Ödeme geçmişi tablosu
- [ ] 🟡 Online ödeme yönlendirmesi

### Bağış
- [ ] 🔴 Bağış sayfası UI
- [ ] 🔴 Tutar seçim butonları (50₺, 100₺, 250₺, 500₺, özel)
- [ ] 🔴 Bağışçı bilgi formu
- [ ] 🔴 Anonim bağış seçeneği
- [ ] 🟡 iyzico veya PayTR entegrasyonu
- [ ] 🟡 Başarı/hata sayfaları
- [ ] 🟡 Otomatik makbuz e-postası
- [ ] 🔵 Düzenli bağış seçeneği (aylık)

### Hesap Numaraları
- [ ] 🔴 Hesap numaraları sayfası
- [ ] 🔴 Banka logoları
- [ ] 🔴 IBAN kopyala butonu (clipboard API)

---

## FAZA 6 — API Geliştirme
**Tahmini süre: 7-10 gün**

### Public API Endpoints
- [ ] 🔴 `GET /api/posts` (haber/duyuru listeleme, filtre, sayfalama)
- [ ] 🔴 `GET /api/posts/:slug` (detay)
- [ ] 🔴 `GET /api/events` (etkinlik listesi)
- [ ] 🔴 `GET /api/events/:slug` (detay)
- [ ] 🔴 `GET /api/galleries` (galeri listesi)
- [ ] 🔴 `GET /api/galleries/:slug` (galeri detay + fotoğraflar)
- [ ] 🔴 `GET /api/videos` (video listesi)
- [ ] 🔴 `GET /api/board-members` (yönetim kurulu)
- [ ] 🔴 `GET /api/sponsors` (sponsorlar)
- [ ] 🔴 `GET /api/settings` (site ayarları)
- [ ] 🔴 `POST /api/contact` (iletişim formu)
- [ ] 🔴 `POST /api/newsletter` (e-posta aboneliği)
- [ ] 🔴 `POST /api/membership/apply` (üyelik başvurusu)
- [ ] 🔴 `POST /api/dues/query` (aidat sorgulama)
- [ ] 🔴 `POST /api/donations` (bağış oluşturma)

### Auth API
- [ ] 🔴 `POST /api/auth/login`
- [ ] 🔴 `POST /api/auth/logout`
- [ ] 🔴 `POST /api/auth/forgot-password`
- [ ] 🔴 `POST /api/auth/reset-password`
- [ ] 🔴 `GET /api/auth/me`

### Admin API
- [ ] 🟡 CRUD endpoints (posts, events, galleries, members)
- [ ] 🟡 `GET /api/admin/dashboard` (istatistikler)
- [ ] 🟡 `PUT /api/admin/members/:id/status` (başvuru onayla/reddet)
- [ ] 🟡 `POST /api/admin/dues` (aidat kaydı ekle)

---

## FAZA 7 — Admin Paneli
**Tahmini süre: 10-14 gün**

- [ ] 🟡 Admin giriş sayfası (`/admin/login`)
- [ ] 🟡 Dashboard (istatistik kartları, grafikler)
- [ ] 🟡 Üye Yönetimi
  - [ ] 🟡 Üye listesi (arama, filtre, sıralama)
  - [ ] 🟡 Üye detay/düzenleme
  - [ ] 🟡 Başvuru onay/red ekranı
  - [ ] 🟡 Toplu üye import (Excel)
- [ ] 🟡 İçerik Yönetimi (CRUD)
  - [ ] 🟡 Haber ekle/düzenle/sil
  - [ ] 🟡 Duyuru ekle/düzenle/sil
  - [ ] 🟡 Etkinlik ekle/düzenle/sil
  - [ ] 🟡 Zengin metin editörü (Tiptap veya Quill)
  - [ ] 🟡 Görsel yükleme (drag & drop)
- [ ] 🟡 Galeri Yönetimi
  - [ ] 🟡 Toplu fotoğraf yükleme
  - [ ] 🟡 Sürükle-bırak sıralama
- [ ] 🟡 Aidat Yönetimi
  - [ ] 🟡 Dönem tanımlama
  - [ ] 🟡 Ödeme kayıt ekranı
  - [ ] 🟡 Toplu aidat raporu
- [ ] 🟡 Bağış Yönetimi (liste, makbuz yazdır)
- [ ] 🟢 Site Ayarları (logo, iletişim, sosyal medya)
- [ ] 🟢 Menü Yönetimi (sürükle-bırak)
- [ ] 🔵 E-posta şablon editörü
- [ ] 🔵 Rol ve yetki yönetimi

---

## FAZA 8 — E-posta & Bildirim Sistemi
**Tahmini süre: 3-5 gün**

- [ ] 🔴 Nodemailer / Resend kurulumu
- [ ] 🔴 E-posta şablonları HTML (React Email ile)
- [ ] 🔴 Üyelik başvurusu alındı e-postası
- [ ] 🔴 Üyelik onay/red e-postası
- [ ] 🔴 Şifre sıfırlama e-postası
- [ ] 🔴 Bağış teşekkür e-postası
- [ ] 🟡 Etkinlik kayıt onay e-postası
- [ ] 🟡 Aidat hatırlatma e-postası (zamanlanmış — cron)
- [ ] 🔵 SMS entegrasyonu (Netgsm)
- [ ] 🔵 Push notification (Üye paneli)

---

## FAZA 9 — i18n (Çok Dil Desteği)
**Tahmini süre: 3-4 gün**

- [ ] 🟡 next-intl kurulumu ve konfigürasyonu
- [ ] 🟡 TR çeviri dosyası (`/public/locales/tr/`)
- [ ] 🟡 EN çeviri dosyası (`/public/locales/en/`)
- [ ] 🟡 Dil bazlı URL routing middleware
- [ ] 🟡 Tüm statik metinlerin i18n key'e taşınması
- [ ] 🟢 Dinamik içerikler için çok dil DB desteği
- [ ] 🔵 Arapça (RTL layout) desteği

---

## FAZA 10 — SEO & Performans
**Tahmini süre: 3-5 gün**

- [ ] 🔴 Her sayfa için `generateMetadata()` fonksiyonu
- [ ] 🔴 Open Graph meta etiketleri
- [ ] 🔴 Twitter Card meta etiketleri
- [ ] 🔴 JSON-LD structured data (Organization)
- [ ] 🔴 Otomatik `sitemap.xml` üretimi
- [ ] 🔴 `robots.txt` konfigürasyonu
- [ ] 🟡 Görsel optimizasyonu (Next.js Image component)
- [ ] 🟡 Lazy loading (tüm görseller)
- [ ] 🟡 Code splitting — route bazlı
- [ ] 🟡 Breadcrumb bileşeni + JSON-LD
- [ ] 🟢 Canonical URL yönetimi
- [ ] 🟢 Core Web Vitals optimizasyonu
- [ ] 🟢 Lighthouse audit ve düzeltmeler

---

## FAZA 11 — Test & QA
**Tahmini süre: 5-7 gün**

- [ ] 🔴 Kritik bileşenler için unit testler (Jest)
- [ ] 🔴 API endpoint testleri (Supertest)
- [ ] 🔴 E2E: Üyelik başvurusu akışı (Playwright)
- [ ] 🔴 E2E: Üye giriş/çıkış akışı
- [ ] 🔴 E2E: Bağış akışı
- [ ] 🟡 Cross-browser testi (Chrome, Firefox, Safari)
- [ ] 🟡 Mobil responsive testi (375px, 768px, 1024px)
- [ ] 🟡 Accessibility audit (axe-core)
- [ ] 🟢 Form validasyon edge case testleri
- [ ] 🟢 Yük testi (k6 veya Artillery)

---

## FAZA 12 — Deployment & DevOps
**Tahmini süre: 2-3 gün**

- [ ] 🔴 Production ortam değişkenlerini ayarla
- [ ] 🔴 Vercel'e deploy (veya VPS kurulumu)
- [ ] 🔴 PostgreSQL production DB kurulumu
- [ ] 🔴 Domain ve DNS konfigürasyonu
- [ ] 🔴 SSL sertifikası (Let's Encrypt)
- [ ] 🟡 Cloudflare CDN kurulumu
- [ ] 🟡 Redis production kurulumu
- [ ] 🟡 Cloudinary veya S3 dosya depolama
- [ ] 🟡 Otomatik DB backup (günlük)
- [ ] 🟢 Uptime monitoring (UptimeRobot)
- [ ] 🟢 Sentry production alertleri
- [ ] 🔵 Staging environment kurulumu

---

## FAZA 13 — İçerik & Son Kontroller
**Tahmini süre: 2-3 gün**

- [ ] 🔴 Demo/gerçek içerikleri admin panelinden gir
- [ ] 🔴 Logo ve görselleri yükle
- [ ] 🔴 İletişim bilgilerini güncelle
- [ ] 🔴 KVKK ve Gizlilik Politikası metinlerini gir
- [ ] 🔴 Hesap numaralarını gir
- [ ] 🔴 Tüm linklerin çalıştığını kontrol et
- [ ] 🔴 Mobil görünümü son kez doğrula
- [ ] 🟡 Google Search Console'a kayıt
- [ ] 🟡 Google Analytics hedeflerini tanımla
- [ ] 🟢 Sosyal medya OG görsellerini oluştur

---

## 🔵 Opsiyonel / İlerideki Geliştirmeler

- [ ] 🔵 Mobil uygulama (React Native)
- [ ] 🔵 Push notification servisi
- [ ] 🔵 Canlı destek chat (Tawk.to entegrasyonu)
- [ ] 🔵 Online ödeme — kredi kartı ile aidat
- [ ] 🔵 Üye forum/topluluk modülü
- [ ] 🔵 E-posta bülteni gönderme sistemi
- [ ] 🔵 Anket / oylama modülü
- [ ] 🔵 İhale modülü (ilan + teklif)
- [ ] 🔵 Döküman kütüphanesi (PDF arşiv)
- [ ] 🔵 QR kod ile etkinlik check-in
- [ ] 🔵 API dokümantasyonu (Swagger UI)
- [ ] 🔵 Dark mode desteği
- [ ] 🔵 Progressive Web App (PWA) özellikleri

---

## 📊 Tamamlanma İzleme

| Faz | Açıklama | Durum | İlerleme |
|-----|----------|-------|----------|
| 0 | Proje Kurulumu | ⏳ Bekliyor | 0% |
| 1 | Layout & Navigasyon | ⏳ Bekliyor | 0% |
| 2 | Anasayfa | ⏳ Bekliyor | 0% |
| 3 | İçerik Sayfaları | ⏳ Bekliyor | 0% |
| 4 | Üyelik & Auth | ⏳ Bekliyor | 0% |
| 5 | Aidat & Bağış | ⏳ Bekliyor | 0% |
| 6 | API Geliştirme | ⏳ Bekliyor | 0% |
| 7 | Admin Paneli | ⏳ Bekliyor | 0% |
| 8 | E-posta & Bildirim | ⏳ Bekliyor | 0% |
| 9 | i18n | ⏳ Bekliyor | 0% |
| 10 | SEO & Performans | ⏳ Bekliyor | 0% |
| 11 | Test & QA | ⏳ Bekliyor | 0% |
| 12 | Deployment | ⏳ Bekliyor | 0% |
| 13 | İçerik & Son Kontrol | ⏳ Bekliyor | 0% |

---

## 🗓️ Önerilen Sprint Planı

| Sprint | Haftalar | Fazlar |
|--------|----------|--------|
| Sprint 1 | 1-2 | Faz 0 + Faz 1 |
| Sprint 2 | 3-4 | Faz 2 + Faz 3 |
| Sprint 3 | 5-6 | Faz 4 + Faz 5 |
| Sprint 4 | 7-8 | Faz 6 |
| Sprint 5 | 9-10 | Faz 7 |
| Sprint 6 | 11 | Faz 8 + Faz 9 |
| Sprint 7 | 12 | Faz 10 + Faz 11 |
| Sprint 8 | 13-14 | Faz 12 + Faz 13 |

---

*Son güncelleme: Nisan 2026*





# 🏛️ Dernek Web Sitesi — Kapsamlı Proje Prompt'u

## Proje Genel Tanımı

Türk dernekleri için tam özellikli, modern ve profesyonel bir web sitesi geliştir. Site; üye yönetimi, etkinlik takvimi, haber/duyuru sistemi, galeri, bağış, aidat sorgulama ve çok dilli destek gibi modülleri kapsayan kurumsal bir platform olacaktır.

---

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Primary:** `#1a3c6e` (koyu lacivert — güven, kurumsallık)
- **Secondary:** `#e8b84b` (altın sarısı — prestij, vurgu)
- **Accent:** `#c0392b` (kırmızı — CTA butonları)
- **Background:** `#f5f7fa`
- **Surface:** `#ffffff`
- **Text Primary:** `#1a1a2e`
- **Text Muted:** `#6c757d`
- **Border:** `#dee2e6`

### Tipografi
- **Başlık Fontu:** `Montserrat` (700, 600) — Google Fonts
- **Gövde Fontu:** `Open Sans` (400, 500) — Google Fonts
- **Font Scale:** 12px / 14px / 16px / 18px / 24px / 32px / 48px

### Layout
- **Max Container Width:** 1280px
- **Grid:** 12 sütunlu CSS Grid + Flexbox hibrit
- **Breakpoints:** Mobile 375px / Tablet 768px / Desktop 1024px / Wide 1440px
- **Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64, 96)

### UI Bileşenleri
- Kartlar: `border-radius: 12px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.08)`
- Butonlar: `border-radius: 6px`, hover animasyonu (`transform: translateY(-2px)`)
- Formlar: floating label pattern, gerçek zamanlı validasyon
- Modal: backdrop blur efekti, smooth open/close animasyonu

---

## 📐 Site Mimarisi ve Sayfalar

### 1. Anasayfa (`/`)
**Bileşenler (yukarıdan aşağıya):**

1. **Top Bar** — tel, whatsapp, dil seçimi (TR/EN), sosyal medya ikonları
2. **Header / Navbar**
   - Logo (sol)
   - Ana navigasyon (orta)
   - Üyelik Başvurusu + Üye Girişi + Bağış Yap butonları (sağ)
   - Sticky scroll davranışı, mobile hamburger menu
3. **Hero Slider**
   - Otomatik geçişli (5s interval), touch/swipe desteği
   - Başlık, açıklama, tarih ve "Detaylar" CTA
   - Dot indikatörler + önceki/sonraki okları
4. **Hızlı Haber Ticker** — yatay kayan son haberler
5. **Başkan Mesajı Widget**
   - Başkan fotoğrafı (sol)
   - Haberler / Duyurular / Faaliyetler / Basında Biz tab'lı içerik (sağ)
6. **Kısayollar Bölümü** — 4 adet ikon + başlık kartı (Tüzük, Etkinlikler, Üyelik, Kimler Başvurabilir)
7. **Hakkımızda Özet**
   - Sol: metin + 3 sayaç (Üye, Etkinlik, Fotoğraf) — count-up animasyonu
   - Sağ: görsel
8. **Foto Galeriler** — 3 kolonlu önizleme, lightbox açılım
9. **Videolar** — thumbnail grid, modal video oynatıcı
10. **Sponsorlar / Destekçiler** — otomatik kayan logo slider
11. **Footer**
    - 4 kolon: İletişim bilgileri / Kurumsal linkler / Multimedya linkler / Sosyal medya + E-posta aboneliği
    - Alt bar: telif, site haritası linki, ziyaretçi sayacı

---

### 2. Derneğimiz

#### 2a. Hakkımızda (`/hakkimizda`)
- Hero banner
- Zengin metin editörü çıktısı (tarihçe, misyon, vizyon)
- Fotoğraflı bölümler
- İstatistik sayaçları

#### 2b. Yönetim Kurulu (`/yonetim-kurulu`)
- Kart grid: fotoğraf, isim, unvan, iletişim
- Hover'da detay kartı açılımı

#### 2c. Dernek Tüzüğü (`/tuzuk`)
- PDF görüntüleyici embed
- İndirme butonu

#### 2d. Üye Listesi (`/uyeler`)
- Arama + filtreleme (ada göre, şehre göre)
- Sayfalama (pagination)
- Her üye: fotoğraf, ad soyad, üyelik tarihi, meslek

#### 2e. Misyon & Vizyon (`/misyon-vizyon`)
- İkonlu iki kolonlu tasarım

---

### 3. Etkinlikler

#### 3a. Etkinlikler (`/etkinlikler`)
- Takvim görünümü + liste görünümü toggle
- Filtre: tarih, kategori, şehir
- Etkinlik kartı: görsel, başlık, tarih, yer, katılım butonu

#### 3b. Etkinlik Detay (`/etkinlikler/:slug`)
- Hero görsel
- Tarih, saat, konum (Google Maps embed)
- Konuşmacılar
- Kayıt/Katılım formu
- Galeri

#### 3c. Webinarlar (`/webinarlar`)
- Benzer etkinlik yapısı, online badge
- Zoom/YouTube link entegrasyonu

---

### 4. Multimedya

#### 4a. Foto Galeriler (`/foto-galeriler`)
- Kategori filtreleme
- Masonry grid layout
- Lightbox ile tam ekran görüntüleme, çoklu fotoğraf geçişi

#### 4b. Galeri Detay (`/foto-galeriler/:slug`)
- Tüm fotoğraflar, başlık, tarih, açıklama

#### 4c. Videolar (`/videolar`)
- YouTube/Vimeo iframe embed
- Thumbnail, başlık, süre
- Modal oynatıcı

#### 4d. Basında Biz (`/basinda-biz`)
- Basın kartları: logo/görsel, kaynak adı, tarih, özet, link

---

### 5. Haberler & Duyurular

#### 5a. Haberler (`/haberler`)
- 3 kolonlu kart grid
- Kategori filtreleme, arama
- Sayfalama

#### 5b. Haber Detay (`/haberler/:slug`)
- Tam makale görünümü
- Sosyal paylaşım butonları
- İlgili haberler bölümü

#### 5c. Duyurular (`/duyurular`) — aynı yapı
#### 5d. Basın Açıklamaları — aynı yapı

---

### 6. Üyelik & Kullanıcı Modülü

#### 6a. Üyelik Başvurusu (`/basvuru-formu`)
**Form Alanları:**
- Ad, Soyad, T.C. Kimlik No (validasyon)
- Doğum Tarihi, Cinsiyet
- E-posta, Telefon
- Adres (İl, İlçe dropdown)
- Meslek, Eğitim Durumu
- Vesikalık fotoğraf yükleme
- Referans Üye (opsiyonel)
- KVKK Onayı (zorunlu checkbox)
- Başvuru durumu takip sistemi

#### 6b. Üye Girişi (Modal veya `/giris`)
- E-posta / telefon + şifre
- "Beni hatırla"
- Şifremi unuttum (e-posta/SMS sıfırlama)

#### 6c. Üye Paneli (`/panel`)
- Profil bilgileri düzenleme
- Aidat durumu görüntüleme
- Etkinlik kayıtları
- Mesaj kutusu

---

### 7. Aidat Sorgulama (`/aidat-sorgulama`)
- TC No veya Üye No girişi
- Güvenlik kodu (CAPTCHA)
- Sonuç: ödeme geçmişi, borç durumu
- Online ödeme yönlendirmesi

---

### 8. Bağış (`/bagis-yap`)
- Bağış miktarı seçimi (hazır tutarlar + özel tutar)
- Bağışçı bilgileri formu (opsiyonel anonim)
- Ödeme entegrasyonu (iyzico / PayTR)
- Başarı sayfası + makbuz e-posta

---

### 9. Hesap Numaraları (`/hesap-numaralari`)
- Banka logoları, IBAN, hesap adı
- Kopyala butonu (clipboard API)

---

### 10. İletişim (`/iletisim`)
- İletişim formu (ad, e-posta, konu, mesaj)
- Google Maps embed
- Adres, telefon, e-posta bilgi kartları
- Çalışma saatleri

---

### 11. Diğer
- **İhaleler** (`/ihaleler`) — ilan kartları, son başvuru tarihi
- **İlanlar** (`/ilanlar`) — genel ilan panosu
- **Site Haritası** (`/sitemap`)
- **KVKK / Gizlilik Politikası**
- **404 Sayfası** — yönlendirme butonu

---

## 🌐 Çok Dilli Destek (i18n)

- Dil: **TR** (varsayılan) ve **EN**
- URL yapısı: `/` (TR), `/en/` (EN)
- `i18next` veya benzeri kütüphane ile namespace bazlı çeviri dosyaları
- Dil seçimi header'da flag + kısaltma

---

## ⚙️ Teknik Gereksinimler

### Frontend Stack
```
Framework:     Next.js 14+ (App Router) veya React 18+
Styling:       Tailwind CSS + CSS Modules (karmaşık bileşenler için)
State Mgmt:    Zustand veya React Context
Forms:         React Hook Form + Zod validasyon
HTTP Client:   Axios veya fetch (React Query ile cache)
i18n:          next-intl veya react-i18next
Slider:        Swiper.js
Lightbox:      yet-another-react-lightbox
Icons:         Lucide React + React Icons
Animasyon:     Framer Motion
Maps:          react-leaflet veya Google Maps React
```

### Backend Stack
```
Runtime:       Node.js 20+ (Express veya Fastify)
               VEYA Next.js API Routes / Server Actions
Database:      PostgreSQL (ana DB) + Redis (session/cache)
ORM:           Prisma
Auth:          NextAuth.js veya JWT (bcrypt)
File Upload:   Multer + Cloudinary veya AWS S3
Email:         Nodemailer + SMTP (veya Resend)
SMS:           Twilio veya Netgsm API
Payment:       iyzico veya PayTR SDK
```

### DevOps
```
Hosting:       Vercel (frontend) + Railway/Render (backend)
               VEYA VPS (Ubuntu + Nginx + PM2)
SSL:           Let's Encrypt
CDN:           Cloudflare
CI/CD:         GitHub Actions
Monitoring:    Sentry (hata takibi)
Analytics:     Google Analytics 4 + Hotjar
```

---

## 🔐 Güvenlik Gereksinimleri

- HTTPS zorunlu (HSTS header)
- CSRF token koruması tüm formlarda
- Rate limiting (login, başvuru, iletişim formları)
- SQL injection koruması (Prisma ORM ile otomatik)
- XSS koruması (DOMPurify — zengin metin içerikleri için)
- reCAPTCHA v3 (form gönderimleri)
- KVKK uyumlu çerez yönetimi (consent banner)
- Kişisel verilerin şifrelenmesi (hassas alanlar)
- Brute force koruması (lockout mekanizması)

---

## 👑 Yönetim Paneli (Admin)

### Kimler Erişebilir
- **Super Admin:** Tüm yetkiler
- **Editor:** İçerik ekleme/düzenleme
- **Moderator:** Üye başvuru onaylama

### Modüller
- Dashboard (istatistik kartları, son aktiviteler)
- Üye Yönetimi (listele, onayla, reddet, düzenle, aidat ekle)
- İçerik Yönetimi (haber, duyuru, etkinlik CRUD)
- Galeri Yönetimi (toplu yükleme, sıralama)
- Bağış Yönetimi (liste, makbuz)
- Aidat Yönetimi (dönemler, ödemeler)
- Başvuru Yönetimi (bekleyen, onaylanan, reddedilenler)
- Ayarlar (site adı, logo, iletişim bilgileri, sosyal medya)
- E-posta Şablonları
- Menü Yönetimi

---

## 📱 Mobil Uygulama Notları (Opsiyonel)

- React Native veya Flutter ile iOS + Android
- Push notification (üyelik onay, aidat hatırlatma)
- Offline erişim (son haberler cache)

---

## 🚀 Performans Hedefleri

- Lighthouse Score: 90+ (tüm kategoriler)
- LCP (Largest Contentful Paint): < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Görseller: WebP formatı, lazy loading, srcset
- Code splitting: route bazlı
- Server-side rendering (SSR) / Static generation (SSG) hibrit kullanımı

---

## 📦 Proje Dizin Yapısı (Önerilen)

```
dernek-web/
├── app/                        # Next.js App Router
│   ├── (public)/               # Halka açık sayfalar
│   │   ├── page.tsx            # Anasayfa
│   │   ├── hakkimizda/
│   │   ├── etkinlikler/
│   │   ├── haberler/
│   │   ├── duyurular/
│   │   ├── foto-galeriler/
│   │   ├── videolar/
│   │   ├── basinda-biz/
│   │   ├── iletisim/
│   │   ├── basvuru-formu/
│   │   ├── bagis-yap/
│   │   ├── aidat-sorgulama/
│   │   └── hesap-numaralari/
│   ├── (auth)/                 # Auth sayfaları
│   │   ├── giris/
│   │   └── panel/
│   ├── (admin)/                # Admin paneli
│   │   └── admin/
│   ├── api/                    # API Routes
│   └── [locale]/               # i18n layout wrapper
├── components/
│   ├── layout/                 # Header, Footer, Navbar
│   ├── ui/                     # Button, Card, Modal, Form vb.
│   ├── home/                   # Anasayfaya özel bileşenler
│   ├── sections/               # Sayfa bölümleri
│   └── admin/                  # Admin panel bileşenleri
├── lib/
│   ├── db/                     # Prisma client
│   ├── auth/                   # NextAuth config
│   ├── email/                  # Email servisi
│   └── utils/                  # Yardımcı fonksiyonlar
├── prisma/
│   └── schema.prisma
├── public/
│   ├── images/
│   └── locales/                # i18n çeviri dosyaları
├── styles/
│   └── globals.css
├── types/                      # TypeScript tipleri
└── middleware.ts               # i18n + auth middleware
```

---

## 🗄️ Veritabanı Şeması (Ana Tablolar)

```sql
-- Üyeler
Members (id, tc_no, first_name, last_name, email, phone, 
         address, city, district, photo_url, status, 
         membership_date, created_at)

-- İçerik (Haber/Duyuru/Basında Biz)
Posts (id, type, title, slug, content, excerpt, 
       cover_image, published_at, author_id, status)

-- Etkinlikler
Events (id, title, slug, description, start_date, end_date,
        location, capacity, is_online, cover_image, status)

-- Etkinlik Kayıtları
EventRegistrations (id, event_id, member_id, registered_at, status)

-- Galeriler
Galleries (id, title, slug, cover_image, date, description)
GalleryPhotos (id, gallery_id, image_url, caption, order)

-- Videolar
Videos (id, title, thumbnail_url, video_url, platform, 
        duration, published_at)

-- Bağışlar
Donations (id, donor_name, donor_email, amount, 
           payment_status, receipt_no, created_at)

-- Aidat Dönemleri
DuesPeriods (id, year, amount, due_date)
DuesPayments (id, member_id, period_id, amount, 
              payment_date, receipt_no, status)

-- Sponsorlar
Sponsors (id, name, logo_url, website, order, is_active)

-- Ayarlar
Settings (key, value, updated_at)

-- Yöneticiler
Admins (id, name, email, password_hash, role, last_login)
```

---

## ✉️ E-posta Şablonları

1. Üyelik başvurusu alındı (üyeye)
2. Üyelik onaylandı (üyeye)
3. Üyelik reddedildi (üyeye + gerekçe)
4. Şifre sıfırlama
5. Aidat hatırlatma
6. Etkinlik kaydı onayı
7. Bağış teşekkür + makbuz
8. Yeni başvuru bildirimi (yöneticiye)

---

## 🧪 Test Gereksinimleri

- Unit testler: Jest + React Testing Library
- E2E testler: Playwright (kritik akışlar: kayıt, giriş, bağış)
- API testleri: Supertest
- Accessibility: axe-core entegrasyonu
- Cross-browser: Chrome, Firefox, Safari, Edge

---

## ♿ Erişilebilirlik (a11y)

- WCAG 2.1 AA uyumluluğu
- Tüm görsellere `alt` metni
- Klavye navigasyonu (Tab, Enter, Escape)
- Screen reader uyumlu ARIA labels
- Renk kontrastı minimum 4.5:1
- Focus indicator görünürlüğü

---

## 🔍 SEO

- Dinamik `<title>` ve `<meta description>` her sayfa için
- Open Graph ve Twitter Card meta etiketleri
- JSON-LD structured data (Organization, Event, Article)
- Canonical URL
- Robots.txt + sitemap.xml otomatik üretimi
- Breadcrumb navigasyonu

---

## 📌 Önemli Notlar

1. Tüm metinler Türkçe karakterlere (ü, ö, ş, ı, ğ, ç) tam uyumlu olmalı
2. Tarih formatı: `DD MMMM YYYY` (Türkçe ay adları)
3. Telefon formatı: `(0850) 311 5142`
4. IBAN kopyala butonu: Türk bankacılık standardı
5. Aidat sorgulama güvenlik kodu: 6 haneli numeric CAPTCHA
6. Bağış modülü KDV muafiyeti bildirimi içermeli
7. KVKK metin şablonu hukuki gerekliliklerle uyumlu olmalı
8. Admin paneli `/admin` path'i gizlenebilmeli (env değişkeni ile)
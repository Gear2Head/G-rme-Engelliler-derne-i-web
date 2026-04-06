# KGED Web Sitesi — Çevrimdışı CMS Planı (ÜCRETSİZ)

> Kırşehir Görme Engelliler Derneği | Veritabanı Olmayan Yayın
> Durum: `✅ Tamamlandı` `🚧 Devam Ediyor` `⏳ Bekliyor` `💡 Öneri`

Aşağıdaki liste, sitenin **Sıfır Maliyet (Firebase olmadan)** yayına alınması ve güncellenmesi için tarafımdan hazırlanan nihai adımlardır. Para ödemenize veya veritabanı açmanıza gerek yoktur! Sitenin kendi Admin Paneli bir JSON Editor olarak baştan yazıldı.

---

## 🟢 1. AŞAMA: VERCEL İLE SİTEYİ YAYINLAMA

Hiçbir ayar yapmadan doğrudan Vercel'e atabilirsiniz.
- [ ] Orijinal projenizi GitHub'a yollayın (Push).
- [ ] Vercel'e girip projeyi import edin.
- [ ] Vercel projenizi otomatik olarak **Vite** üzerinden derleyecektir. Siteniz saniyeler içerisinde yayına alınacak!

---

## 🟠 2. AŞAMA: YÖNETİCİ PANELİNİ ÜCRETSİZ KULLANMA (Sıfır Firebase)

Sitenizi güncellemek istediğinizde tamamen **offline (Çevrimdışı)** Admin panelini kullanacaksınız. Veritabanına bulaşmanıza EN UFAK gerek kalmadı!

- [ ] Bilgisayarınızda veya sitenizden `localhost:3000/admin/` (Veya canlı domaininizdeki `site.com/admin/`) adresine gidin.
- [ ] **Giriş Bilgileri:**
  - Kullanıcı Adı: `admin`
  - Şifre: `kged2026`
- [ ] Karşınıza gelen menüde:
  - Hakkımızda yazılarını güncelleyebilirsiniz.
  - İletişim e-posta, tel girebilirsiniz.
  - **Siteye (Galeri'ye) ücretsiz Resim ekleyebilirsiniz.** Resimler sistem içerisinde otomatik ufaltılır (max 800px) ve metne dönüştürülür.
- [ ] Düzenlemeleri yaptıktan sonra **Değişiklikleri Dosya Olarak İndir (site-content.json)** butonuna basın.
- [ ] Bilgisayarınıza inen bu `site-content.json` dosyasını alın ve kodlarınız içerisindeki `src/data/` klasöründeki eski dosyanın üzerine kaydedin. 
- [ ] `git push` ile bu ufak json değişikliğini Github'a yollayın. Vercel sitenizi 5 saniye içinde Ücretsiz olarak güncelleyecektir!

Sonsuza dek ücretsiz siteniz hayırlı olsun! 🚀
kirged.org sitesinin içindeki güvenlik açıklarını tespit etmesi için aia kodların içinde hata araması ve çözüm üret

GÖREV KİRGED (React/Vite/Supabase/Vercel) kaynak kodunu tara. Zafiyetleri bul. Düzeltme kodu üret. Açıklama yapma. Token kullanımını minimize et.
KONTROL EDİLECEK VEKTÖRLER YAPILANDIRMA
* VITE_ prefix sızıntıları
* .env ifşası
* CORS yapılandırma hataları
* Build konfigürasyon güvenlik analizi
SUPABASE & AUTH
* RLS (Row Level Security) bypass tespiti
* JWT ve Session token depolama zafiyetleri (localStorage kaynaklı XSS riskleri)
* Yetkisiz veri manipülasyonu ve yetki yükseltme (Privilege Escalation) riskleri
CLIENT & REACT
* XSS: dangerouslySetInnerHTML ve sanitize edilmemiş input tespiti
* DOM-based XSS: URL ve history manipülasyonu
* Yetersiz route koruması (Protected Routes bypass)
* İstemci state'inde veya loglarda hassas veri sızıntısı
VERİ AKIŞI
* Form input validasyon ve sanitizasyon eksiklikleri
* İstemci tabanlı Supabase sorgularında data injection riskleri
* Rate limiting eksiklikleri
BEKLENEN ÇIKTI FORMATI DOSYA: [dosya_yolu] RİSK: [Kritik/Yüksek/Orta/Düşük] SORUN: [Kısa tanım] ÇÖZÜM: [Sadece düzeltilmiş kod]

Show more
8:28 PM
Güvenlik Analizi Raporu
DOSYA: admin/index.html RİSK: Kritik SORUN: Admin paneli oturum açık olsa bile doğrudan URL ile erişilebilir; client-side session check bypass edilebilir. getSession() async olduğu için kısa süre admin UI görünür.

ÇÖZÜM:

html
<style>
  .admin-app { display: none !important; opacity: 0; }
  #login-page { display: flex; }
</style>
javascript
// Mevcut kod: showDashboard() direkt UI gösteriyor
// Değiştir:
async function showDashboard() {
  const session = await getSession();
  if (!session) { showLogin(); return; }
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin-app').style.removeProperty('display');
  document.getElementById('admin-app').classList.add('visible');
  await loadSiteContent();
  window.switchTab('dashboard', document.querySelector('.nav-item'));
}

// Init:
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession();
  if (session) await showDashboard();
  else showLogin();
});
DOSYA: admin/index.html RİSK: Kritik SORUN: announcement.content XSS — ${announcement.content} doğrudan innerHTML'e yazılıyor. Admin panelde ve site-renderer.js detay sayfasında sanitize edilmemiş HTML.

ÇÖZÜM:

javascript
// admin/index.html içine DOMPurify ekle (head'e):
// <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js"></script>

// renderAnnouncementRows() içinde textarea value set ederken:
r.value = ann.content || '';

// save sırasında:
window.updateAnnouncement = (idx, field, val) => {
  if (!siteContent.announcements[idx]) return;
  if (field === 'content') {
    val = DOMPurify.sanitize(val, { ALLOWED_TAGS: ['p','br','strong','em','ul','ol','li','h2','h3','a'], ALLOWED_ATTR: ['href'] });
  }
  siteContent.announcements[idx][field] = val;
};
javascript
// src/build/site-renderer.js - renderAnnouncementDetailPage() içinde:
// ÖNCE:
${announcement.content}

// SONRA (server-side için basit strip):
function sanitizeHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
             .replace(/javascript:/gi, '');
}
// ...
${sanitizeHtml(announcement.content)}
DOSYA: src/build/site-renderer.js RİSK: Kritik SORUN: renderContactContent() içindeki contact form submit handler alert() kullanıyor ve form hiçbir yere gitmiyor; ama daha kritik olarak announcement.content raw HTML inject. Ayrıca renderAnnouncementsContent() içinde ann.content sanitize edilmeksizin DOM'a yazılıyor.

ÇÖZÜM:

javascript
// renderAnnouncementsContent() - card content:
// ÖNCE:
<div class="announcement-card__content typography">${ann.content}</div>

// SONRA:
<div class="announcement-card__content typography">${sanitizeHtml(ann.content)}</div>

// sanitizeHtml fonksiyonu dosyanın başına ekle:
function sanitizeHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '');
}
DOSYA: src/scripts/hydrate.js RİSK: Yüksek SORUN: live-board-container innerHTML ile yazılıyor, escapeHtml kullanıyor ama Supabase'den gelen verinin tamamı güvenilir sayılıyor. config nesnesi manipüle edilmişse XSS vektörü açılır.

ÇÖZÜM:

javascript
// Mevcut escapeHtml import var, yeterli. Ancak innerHTML yerine textContent kullan:
function updateText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = String(value).slice(0, 500); // uzunluk sınırı
}
DOSYA: src/supabase/auth.js RİSK: Yüksek SORUN: getSession() token'ı localStorage'da saklıyor (Supabase default). XSS gerçekleşirse token çalınabilir. login() hata mesajı direkt fırlatılıyor, brute-force'a açık.

ÇÖZÜM:

javascript
// src/supabase/config.js - createClient options ekle:
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: sessionStorage, // localStorage yerine sessionStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    })
  : null;
DOSYA: admin/index.html RİSK: Yüksek SORUN: Login lockout localStorage'da tutuluyor — kullanıcı localStorage'ı temizleyerek bypass edebilir. MAX_ATTEMPTS = 5 client-side only.

ÇÖZÜM:

javascript
// Supabase'de server-side rate limiting yoksa en azından
// lockout'u memory'de tut + exponential backoff uygula:
const _lockoutState = { attempts: 0, until: 0 }; // sessionStorage veya memory

function getLockout() {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, until: 0 };
  } catch { return { attempts: 0, until: 0 }; }
}

function setLockout(data) {
  sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
}

// Exponential backoff:
const LOCKOUT_DURATION_MS = Math.min(30000 * Math.pow(2, getLockout().attempts - MAX_ATTEMPTS), 3600000);
DOSYA: admin/index.html RİSK: Yüksek SORUN: window.handleDeleteGallery, window.handleDeleteAlbum, window.saveAnnouncements gibi kritik fonksiyonlar global window scope'a atanmış. Konsol üzerinden veya XSS ile çağrılabilir.

ÇÖZÜM:

javascript
// Global atama yerine event delegation kullan.
// Şu an inline onclick kullanan butonlar için data attribute pattern:

document.addEventListener('click', async (e) => {
  const session = await getSession();
  if (!session) return; // auth guard

  if (e.target.matches('[data-action="delete-gallery"]')) {
    const id = e.target.dataset.id;
    const url = e.target.dataset.url;
    await handleDeleteGallery(id, url);
  }
  if (e.target.matches('[data-action="delete-album"]')) {
    await handleDeleteAlbum(e.target.dataset.album);
  }
});

// HTML'de:
// onclick="window.handleDeleteGallery(...)" 
// yerine:
// data-action="delete-gallery" data-id="${item.id}" data-url="${item.url}"
DOSYA: vercel.json RİSK: Orta SORUN: CSP 'unsafe-inline' script ve style için izin veriyor. Bu XSS mitigasyonunu büyük ölçüde devre dışı bırakır.

ÇÖZÜM:

json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'nonce-{{NONCE}}' https://va.vercel-scripts.com; style-src 'self' 'nonce-{{NONCE}}' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; frame-src 'self' https://www.google.com https://maps.google.com; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co; object-src 'none'; base-uri 'self'"
}
unsafe-inline kaldırılamıyorsa kısa vadede en azından object-src 'none' ve base-uri 'self' ekle.

DOSYA: src/supabase/gallery.js RİSK: Orta SORUN: uploadGalleryImage() dosya tipi server-side doğrulanmıyor. Client-side accept="image/*" bypass edilebilir. Path sanitization var ama MIME kontrolü yok.

ÇÖZÜM:

javascript
export async function uploadGalleryImage(file, path) {
  // MIME whitelist kontrolü
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const fileType = file.type || '';
  if (!ALLOWED_MIME.includes(fileType)) {
    throw new Error('Desteklenmeyen dosya türü. Yalnızca JPEG, PNG, WebP ve GIF yüklenebilir.');
  }
  
  // Dosya boyutu kontrolü (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Dosya boyutu 5MB sınırını aşıyor.');
  }

  const safePath = sanitizePath(path);
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(safePath, file, { 
      cacheControl: '3600', 
      upsert: false,
      contentType: fileType // explicit content-type
    });
  if (error) throw error;

  const { data: publicURLData } = supabase.storage
    .from('gallery')
    .getPublicUrl(safePath);

  return publicURLData.publicUrl;
}
DOSYA: src/scripts/main.js RİSK: Düşük SORUN: KVKK banner'ında localStorage.setItem kullanımı; kötü niyetli bir script kged-kvkk-accepted key'ini okuyup kullanıcı takibi yapabilir. Ayrıca window.__showToast global atama gereksiz yüzey.

ÇÖZÜM:

javascript
// window.__showToast yerine custom event kullan:
// main.js:
document.addEventListener('kged:toast', (e) => {
  showToast(e.detail.message, e.detail.type, e.detail.duration);
});

// Kullanım (admin veya diğer modüller):
document.dispatchEvent(new CustomEvent('kged:toast', {
  detail: { message: 'Kaydedildi', type: 'success', duration: 3000 }
}));
DOSYA: src/supabase/site_config.js + Supabase RLS RİSK: Kritik (yapılandırma) SORUN: saveSiteConfig() anonim key ile upsert yapıyor. Supabase'de site_config tablosunda RLS kuralı yoksa herhangi bir kullanıcı siteyi manipüle edebilir.

ÇÖZÜM (Supabase SQL):

sql
-- site_config tablosu için RLS:
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir:
CREATE POLICY "Public read" ON site_config
  FOR SELECT USING (true);

-- Sadece authenticated admin yazabilir:
CREATE POLICY "Admin write" ON site_config
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- gallery_items için:
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Auth write gallery" ON gallery_items
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


  DOSYA: admin/index.html RİSK: Kritik SORUN: İstemci Taraflı Route Koruması Eksikliği. Güvenli alanlar sadece CSS sınıfları ile (display: none) gizleniyor, gerçek bir oturum validasyonu ile render engellemesi yapılmıyor. ÇÖZÜM:

javascript
document.addEventListener('DOMContentLoaded', async () => {
  const session = await getSession();
  if (session) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-app').classList.add('visible');
  } else {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-app').classList.remove('visible');
  }
});
DOSYA: admin/index.html RİSK: Yüksek SORUN: Brute Force / Rate Limiting Atlatması. Giriş denemeleri sayacı ve kilitlenme (lockout) güvenli olmayan localStorage üzerinde tutuluyor. ÇÖZÜM:

javascript
async function handleLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');
  errorEl.classList.remove('visible');
  const btn = document.getElementById('login-submit');
  btn.disabled = true;
  
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  
  try {
    await login(email, password);
    showDashboard();
  } catch (error) {
    if (error.status === 429) {
      errorText.textContent = 'Çok fazla giriş denemesi yapıldı. Lütfen bekleyin.';
    } else {
      errorText.textContent = 'E-posta veya şifre hatalı.';
    }
    errorEl.classList.add('visible');
  } finally {
    btn.disabled = false;
  }
}
DOSYA: src/supabase/gallery.js RİSK: Yüksek SORUN: Eksik MIME Validasyonu (Unrestricted File Upload). Sadece dosya adı temizleniyor, dosyanın türü kontrol edilmediği için zararlı SVG veya HTML kodları içeren dosyalar (Stored XSS) yüklenebilir. ÇÖZÜM:

javascript
export async function uploadGalleryImage(file, path) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Sadece görsel formatları (.jpg, .png, .webp, .gif) yüklenebilir.');
  }
  const safePath = sanitizePath(path);
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(safePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: publicURLData } = supabase.storage
    .from('gallery')
    .getPublicUrl(safePath);
  return publicURLData.publicUrl;
}
DOSYA: vercel.json RİSK: Yüksek SORUN: Zayıf Content Security Policy (CSP). script-src direktifinde 'unsafe-inline' kullanılması olası XSS açıklarının doğrudan çalıştırılmasına olanak tanır. ÇÖZÜM:

json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' https://va.vercel-scripts.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: https://images.unsplash.com; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'self'; connect-src 'self' https://images.unsplash.com https://maps.googleapis.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co; worker-src 'self'"
}
DOSYA: src/scripts/toast.js, admin/index.html RİSK: Orta SORUN: DOM-Based XSS Zafiyeti. showToast fonksiyonunda dinamik olarak gelen hatalar veya içerikler innerHTML vasıtasıyla escape edilmeden doğrudan DOM'a ekleniyor. ÇÖZÜM:

javascript
export function showToast(message, type = 'info', duration = 3500) {
  const container = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  const icons = {
    success: '<svg>...</svg>',
    error: '<svg>...</svg>',
    info: '<svg>...</svg>'
  };
  const iconHtml = icons[type] || icons.info;
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message; 
  toast.innerHTML = iconHtml;
  toast.appendChild(msgSpan);
  container.appendChild(toast);
  const remove = () => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  return { remove };
}
DOSYA: src/supabase/site_config.js RİSK: Kritik SORUN: Supabase RLS Bypass (Yetki Yükseltme). saveSiteConfig fonksiyonunda auth check yapılmaması ve Supabase üzerindeki olası permissive RLS (veya RLS olmaması), anonim kullanıcıların site verilerini (site_config) manipüle etmesine olanak tanır. ÇÖZÜM:

javascript
export async function saveSiteConfig(configData) {
  // Sadece yetkili session ile çalışmaya zorla
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error("Yetkisiz işlem: Oturum bulunamadı.");

  const { data, error } = await supabase
    .from('site_config')
    .upsert({ id: 'content', data: configData, updated_at: new Date().toISOString() })
    .select();
    
  if (error) throw error;
  return data;
}

// Ek olarak SQL Console'dan çalıştırılmalı:
// ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Auth check update" ON public.site_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DOSYA: src/build/site-renderer.js RİSK: Kritik SORUN: Stored XSS (Admin Paneli kaynaklı). renderAnnouncementsContent() içinde \`${ann.content}\` güvenli olmayan içerik doğrudan HTML template içerisine inject ediliyor. DOMPurify ile temizlenmeli. ÇÖZÜM:

javascript
// renderAnnouncementsContent fonksiyonu içerisinde:
// const safeContent = DOMPurify.sanitize ? DOMPurify.sanitize(ann.content) : import_dompurify_and_sanitize(ann.content);
import DOMPurify from 'isomorphic-dompurify'; // Dosya başına eklenir

// Template string içerisinde:
// ÖNCE: <div class="announcement-card__content typography">${ann.content}</div>
// SONRA: 
<div class="announcement-card__content typography">${DOMPurify.sanitize(ann.content, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'] })}</div>
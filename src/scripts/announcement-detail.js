/**
 * AMAÇ: Duyuru detay sayfası — URL slug'ına göre Supabase'den içerik çek
 * MANTIK: window.location.pathname'den slug al → getSiteConfig() → eşleşen duyuruyu render et
 */
import { getSiteConfig } from '../supabase/site_config.js';

function slugify(text) {
  if (!text) return '';
  const trMap = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O' };
  return text.toString().toLowerCase()
    .replace(/[çÇğĞşŞüÜıİöÖ]/g, m => trMap[m])
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

async function initAnnouncementDetail() {
  // URL: /duyurular/ofis → slug: "ofis"
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1];

  if (!slug || slug === 'detay' || slug === 'duyurular') {
    // Slug yok, duyurular listesine yönlendir
    window.location.replace('/duyurular');
    return;
  }

  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;

  // Skeleton göster
  mainEl.innerHTML = `
    <div style="max-width:800px;margin:4rem auto;padding:0 1.5rem;">
      <div style="height:2rem;background:var(--color-primary-50);border-radius:8px;margin-bottom:1rem;animation:pulse 1.5s ease infinite;"></div>
      <div style="height:1rem;background:var(--color-primary-50);border-radius:8px;width:60%;margin-bottom:2rem;animation:pulse 1.5s ease infinite;"></div>
      <div style="height:300px;background:var(--color-primary-50);border-radius:16px;animation:pulse 1.5s ease infinite;"></div>
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
      ?.setAttribute('content', ann.content?.replace(/<[^>]+>/g,'').slice(0,160) || '');

    // Görsel
    const imgHtml = ann.image
      ? `<img src="${ann.image}" alt="${escapeHtml(ann.title)}" 
             style="width:100%;max-height:420px;object-fit:cover;border-radius:16px;margin-bottom:2rem;" />`
      : '';

    // İçerik — DOMPurify ile sanitize et (varsa)
    const rawContent = ann.content || '';
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
          <ol style="display:flex;gap:0.5rem;list-style:none;font-size:0.85rem;color:var(--color-text-muted);flex-wrap:wrap;padding:0;">
            <li><a href="/" style="color:var(--color-primary-600);text-decoration:none;">Ana Sayfa</a></li>
            <li aria-hidden="true" style="color:var(--color-primary-200);">›</li>
            <li><a href="/duyurular" style="color:var(--color-primary-600);text-decoration:none;">Duyurular</a></li>
            <li aria-hidden="true" style="color:var(--color-primary-200);">›</li>
            <li aria-current="page" style="color:var(--color-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${escapeHtml(ann.title)}</li>
          </ol>
        </nav>

        <!-- Kategori + Tarih -->
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1.25rem;">
          ${ann.category ? `<span style="padding:4px 12px;background:var(--color-primary-50);color:var(--color-primary-700);border-radius:999px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${ann.category}</span>` : ''}
          ${dateStr ? `<time style="font-size:0.85rem;color:var(--color-text-muted);" datetime="${ann.date || ''}">${dateStr}</time>` : ''}
        </div>

        <!-- Başlık -->
        <h1 style="font-size:clamp(1.5rem,5vw,2.5rem);font-weight:800;line-height:1.2;letter-spacing:-0.03em;margin-bottom:1.5rem;color:var(--color-primary-900);">
          ${escapeHtml(ann.title)}
        </h1>

        <!-- Görsel -->
        ${imgHtml}

        <!-- İçerik -->
        <div class="typography" style="color:var(--color-text-muted);line-height:1.8;font-size:1.05rem;">
          ${cleanContent}
        </div>

        <!-- Link Preview varsa -->
        ${ann.preview ? `
          <div class="link-preview-card" style="margin-top:2.5rem;">
            <a href="${escapeHtml(ann.preview.url)}" target="_blank" rel="noopener noreferrer" class="link-preview-link">
              <div class="link-preview-grid">
                ${ann.preview.image ? `<div class="link-preview-image-wrap"><img src="${escapeHtml(ann.preview.image)}" alt="" class="link-preview-image" loading="lazy" /></div>` : ''}
                <div class="link-preview-content">
                  <span class="link-preview-site">${escapeHtml(ann.preview.siteName || 'Harici Haber')}</span>
                  <p style="font-weight:600;font-size:1rem;margin:0 0 4px;color:var(--color-primary-900);">${escapeHtml(ann.preview.title || '')}</p>
                  <p style="font-size:0.85rem;color:var(--color-text-muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(ann.preview.description || '')}</p>
                </div>
              </div>
            </a>
          </div>` : ''}

        <!-- Geri Dön -->
        <div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--color-primary-100);">
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnnouncementDetail);
} else {
  initAnnouncementDetail();
}

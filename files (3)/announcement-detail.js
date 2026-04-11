/**
 * DOSYA: src/scripts/announcement-detail.js
 * AMAÇ: /duyurular/:slug URL'inde duyuruyu Supabase'den çekip render eder.
 *       linkPreview varsa → o siteye yönlendirir.
 *       linkPreview yoksa → içeriği sayfada gösterir.
 */

import { getSiteConfig } from '../supabase/site_config.js';

// Türkçe karakterleri slug'a çevir
function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Düz metni basit paragraflara çevir
function textToHtml(raw) {
  const stripped = raw.replace(/<[^>]*>/g,'').trim();
  if (!stripped) return '';
  return stripped.split(/\n{2,}/)
    .map(p => `<p style="margin-bottom:1rem;">${escHtml(p.replace(/\n/g,'<br>'))}</p>`)
    .join('');
}

async function run() {
  // /duyurular/ofis → slug = "ofis"
  const parts = window.location.pathname.replace(/\/+$/,'').split('/');
  const slug = parts[parts.length - 1];

  if (!slug || slug === 'duyurular' || slug === 'detay') {
    window.location.replace('/duyurular');
    return;
  }

  const main = document.getElementById('main-content');
  if (!main) return;

  // Skeleton
  main.innerHTML = `
    <div style="max-width:760px;margin:3rem auto;padding:0 1.5rem 4rem;">
      ${['80%','50%','100%','100%','70%'].map(w =>
        `<div style="height:1.1rem;background:var(--color-surface);border-radius:6px;
                     width:${w};margin-bottom:.85rem;
                     animation:_sk 1.4s ease-in-out infinite alternate;"></div>`
      ).join('')}
    </div>
    <style>@keyframes _sk{from{opacity:.4}to{opacity:1}}</style>`;

  let config;
  try {
    config = await getSiteConfig();
  } catch (e) {
    _showError(main, 'İçerik yüklenirken bağlantı hatası oluştu.');
    return;
  }

  if (!config?.announcements?.length) {
    _show404(main);
    return;
  }

  const ann = config.announcements.find(a => slugify(a.title) === slug);
  if (!ann) { _show404(main); return; }

  // ── linkPreview varsa: direkt yönlendir ──────────────────
  if (ann.linkPreview?.url) {
    // Kısa "yönlendiriliyor" ekranı göster, sonra git
    main.innerHTML = `
      <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;
                  text-align:center;padding:2rem;flex-direction:column;gap:1rem;">
        <div style="width:48px;height:48px;border:3px solid var(--color-primary-200);
                    border-top-color:var(--color-primary-600);border-radius:50%;
                    animation:_spin 0.8s linear infinite;"></div>
        <p style="color:var(--color-text-muted);font-size:.95rem;">
          Haber kaynağına yönlendiriliyorsunuz…
        </p>
        <a href="${escHtml(ann.linkPreview.url)}" target="_blank" rel="noopener noreferrer"
           style="font-size:.8rem;color:var(--color-primary-600);">
          Otomatik gitmezse buraya tıklayın ↗
        </a>
      </div>
      <style>@keyframes _spin{to{transform:rotate(360deg)}}</style>`;

    // 800ms sonra yeni sekmede aç, bu sayfa /duyurular'a döner
    setTimeout(() => {
      window.open(ann.linkPreview.url, '_blank', 'noopener,noreferrer');
      window.location.replace('/duyurular');
    }, 800);
    return;
  }

  // ── linkPreview yok: içeriği sayfada göster ─────────────
  document.title = `${ann.title} | KGED`;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) {
    const plain = (ann.content ?? ann.summary ?? '').replace(/<[^>]*>/g,'').slice(0,160);
    descMeta.setAttribute('content', plain);
  }

  const dateStr = ann.date
    ? new Date(ann.date).toLocaleDateString('tr-TR',
        {day:'numeric', month:'long', year:'numeric'})
    : '';

  const imgHtml = ann.image
    ? `<img src="${escHtml(ann.image)}" alt="${escHtml(ann.title)}"
            style="width:100%;max-height:420px;object-fit:cover;border-radius:14px;
                   margin-bottom:2rem;display:block;" loading="lazy"/>`
    : '';

  const rawContent = ann.content ?? ann.summary ?? '';
  // HTML içeriyorsa DOMPurify ile temizle, yoksa düz metni paragrafa çevir
  let contentHtml;
  if (/<[a-z][\s\S]*>/i.test(rawContent)) {
    contentHtml = (typeof DOMPurify !== 'undefined')
      ? DOMPurify.sanitize(rawContent)
      : rawContent;
  } else {
    contentHtml = textToHtml(rawContent);
  }

  main.innerHTML = `
    <article style="max-width:760px;margin:3rem auto;padding:0 1.5rem 5rem;">

      <!-- Breadcrumb -->
      <nav aria-label="Sayfa konumu" style="margin-bottom:1.75rem;">
        <ol style="display:flex;gap:.4rem;list-style:none;font-size:.82rem;
                   color:var(--color-text-muted);flex-wrap:wrap;align-items:center;">
          <li><a href="/" style="color:var(--color-text-link);text-decoration:none;">Ana Sayfa</a></li>
          <li style="color:var(--color-text-faint);">›</li>
          <li><a href="/duyurular" style="color:var(--color-text-link);text-decoration:none;">Duyurular</a></li>
          <li style="color:var(--color-text-faint);">›</li>
          <li style="color:var(--color-text-muted);overflow:hidden;text-overflow:ellipsis;
                     white-space:nowrap;max-width:220px;" aria-current="page">${escHtml(ann.title)}</li>
        </ol>
      </nav>

      <!-- Kategori + Tarih -->
      <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin-bottom:1.1rem;">
        ${ann.category ? `<span style="padding:2px 12px;background:var(--color-primary-50);
          color:var(--color-primary-700);border-radius:999px;font-size:.72rem;font-weight:700;
          text-transform:uppercase;letter-spacing:.05em;">${escHtml(ann.category)}</span>` : ''}
        ${dateStr ? `<time datetime="${escHtml(ann.date ?? '')}"
          style="font-size:.82rem;color:var(--color-text-muted);">${dateStr}</time>` : ''}
      </div>

      <!-- Başlık -->
      <h1 style="font-size:clamp(1.5rem,5vw,2.25rem);font-weight:800;line-height:1.25;
                 letter-spacing:-.03em;margin-bottom:1.5rem;color:var(--color-text);">
        ${escHtml(ann.title)}
      </h1>

      <!-- Görsel -->
      ${imgHtml}

      <!-- İçerik -->
      <div style="color:var(--color-text);line-height:1.85;font-size:1.05rem;">
        ${contentHtml}
      </div>

      <!-- Geri -->
      <div style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--color-border);">
        <a href="/duyurular" class="btn btn--secondary">← Tüm Duyurulara Dön</a>
      </div>

    </article>`;
}

function _show404(main) {
  main.innerHTML = `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;
                text-align:center;padding:2rem;flex-direction:column;gap:1rem;">
      <p style="font-size:3.5rem;line-height:1;">🔍</p>
      <h1 style="font-size:1.6rem;font-weight:700;">Duyuru Bulunamadı</h1>
      <p style="color:var(--color-text-muted);max-width:38ch;">
        Bu duyuru kaldırılmış veya adres değişmiş olabilir.
      </p>
      <a href="/duyurular" class="btn btn--primary" style="margin-top:.5rem;">
        Tüm Duyurulara Dön
      </a>
    </div>`;
}

function _showError(main, msg) {
  main.innerHTML = `
    <div style="text-align:center;padding:4rem 2rem;">
      <p style="color:var(--color-error-text);margin-bottom:1rem;">${escHtml(msg)}</p>
      <button onclick="location.reload()" class="btn btn--secondary">Tekrar Dene</button>
    </div>`;
}

document.addEventListener('DOMContentLoaded', run);

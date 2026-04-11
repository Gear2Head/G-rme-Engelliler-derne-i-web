import { getSiteConfig } from '../supabase/site_config.js';
import { escapeHtml } from '../utils/html.js';

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

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, '').slice(0, 200);
}

function renderLinkPreview(preview) {
  if (!preview || !preview.url) return '';
  return `
    <div class="link-preview-card">
      <a href="${escapeHtml(preview.url)}" target="_blank" rel="noopener noreferrer" class="link-preview-link">
        <div class="link-preview-grid">
          ${preview.image ? `<div class="link-preview-image-wrap"><img src="${escapeHtml(preview.image)}" alt="" class="link-preview-image" loading="lazy" /></div>` : ''}
          <div class="link-preview-content">
            <span class="link-preview-site">${escapeHtml(preview.siteName || 'Harici Haber')}</span>
            <h3 class="link-preview-title">${escapeHtml(preview.title)}</h3>
            <p class="link-preview-desc">${escapeHtml(preview.description)}</p>
            <div class="link-preview-footer">
               <span>Kaynak: ${new URL(preview.url).hostname}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

export async function initHydration() {
  try {
    const config = await getSiteConfig();
    if (!config) {
      console.info('[KGED] Supabase site_config boş — statik verilerle devam ediliyor.');
      return;
    }

    // Hero is permanently hardcoded for SEO keyword targeting.
    // updateText('live-hero-title', config.hero?.title);
    updateText('live-hero-cta-label', config.hero?.cta?.primary?.label);

    updateText('live-about-page-title', config.about?.title);
    updateText('live-about-page-lead', config.about?.pageLead);
    updateText('live-about-intro-heading', config.about?.introHeading);
    updateText('live-about-intro', config.about?.intro);
    updateText('live-about-description', config.about?.description);

    if (config.board && config.board.length > 0) {
      const container = document.getElementById('live-board-container');
      if (container) {
        container.innerHTML = `
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);padding:var(--space-6);box-shadow:var(--shadow-sm);">
            <ul style="list-style:none;padding:0;margin:0;display:grid;gap:var(--space-4);">
              ${config.board.map((member, idx) => `
                <li style="display:flex;align-items:center;gap:var(--space-4);padding-bottom:${idx === config.board.length - 1 ? '0' : 'var(--space-4)'};border-bottom:${idx === config.board.length - 1 ? 'none' : '1px solid var(--color-border)'};">
                  <div style="width:40px;height:40px;background:var(--color-primary-100);color:var(--color-primary-700);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${idx + 1}</div>
                  <div style="flex:1;">
                    <p style="font-weight:600;color:var(--color-text);margin-bottom:0.25rem;">${escapeHtml(member.name)}</p>
                    <p style="font-size:0.85rem;color:var(--color-text-muted);">${escapeHtml(member.role)}</p>
                  </div>
                </li>`).join('')}
            </ul>
          </div>`;
      }
    }

    if (config._last_updated) {
      const dateStr = new Date(config._last_updated).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      updateText('last-updated-date', dateStr);
    }

    if (config.about && config.about.intro) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', config.about.intro);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', config.about.intro);
    }

    // BUG-01+BUG-12: Duyuru hydration — Supabase'den gelen duyuruları client-side render et
    const annGrid = document.querySelector('.announcements-grid');
    if (annGrid && config.announcements && config.announcements.length > 0) {
      annGrid.innerHTML = config.announcements.map(ann => {
        const slug = slugify(ann.title || '');
        const dateStr = ann.date
          ? new Date(ann.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Tarih Belirtilmedi';
        const imgSrc = ann.image || '/logo.png';
        return `<article class="announcement-card" id="${escapeHtml(slug)}">
          <div class="announcement-card__image-wrap">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(ann.title)}" class="announcement-card__image" loading="lazy" />
          </div>
          <div class="announcement-card__body">
            <div class="announcement-card__meta">
              <time datetime="${ann.date || ''}">${escapeHtml(dateStr)}</time>
              ${ann.category ? `<span class="announcement-card__tag">${escapeHtml(ann.category)}</span>` : ''}
            </div>
            <h2 class="announcement-card__title">${escapeHtml(ann.title)}</h2>
            <div class="announcement-card__content typography">${stripHtml(ann.content || '')}</div>
            ${renderLinkPreview(ann.preview)}
            <div style="margin-top: 1.5rem;">
              <a href="/duyurular/${slug}" class="btn btn--secondary btn--sm" style="width:100%; justify-content:center;">Devamını Oku</a>
            </div>
          </div>
        </article>`;
      }).join('');
    }

  } catch (err) {
    console.warn('[KGED] Hydrate hatası (site statik verilerle devam ediyor):', err);
  }
}

function updateText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = String(value).slice(0, 500);
}


// BUG-05: Client-side announcement detail hydration
// When a user navigates to /duyurular/:slug, this script fetches
// the latest announcements from Supabase and renders the matching one.

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

async function initAnnouncementDetail() {
  const slug = window.location.pathname.split('/duyurular/')[1]?.replace(/\/$/, '');
  if (!slug) return;

  try {
    const config = await getSiteConfig();
    if (!config || !config.announcements) return;

    const announcement = config.announcements.find(a => slugify(a.title) === slug);
    if (!announcement) return;

    // Update page title
    document.title = `${announcement.title} | KGED`;

    // Update heading
    const titleEl = document.querySelector('.page-header__title');
    if (titleEl) titleEl.textContent = announcement.title;

    // Update date
    const dateEl = document.querySelector('.page-header time');
    if (dateEl && announcement.date) {
      dateEl.textContent = new Date(announcement.date).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    // Update hero background
    if (announcement.image) {
      const header = document.querySelector('.page-header--announcement');
      if (header) {
        header.style.backgroundImage = `linear-gradient(rgba(10, 27, 53, 0.8), rgba(10, 27, 53, 0.9)), url('${announcement.image}')`;
      }
    }

    // Update main image
    const mainImg = document.querySelector('.announcements-main img');
    if (mainImg && announcement.image) {
      mainImg.src = announcement.image;
      mainImg.alt = announcement.title;
    }

    // Update content body  
    const contentEl = document.querySelector('.announcements-main .typography');
    if (contentEl && announcement.content) {
      // ASSUME: DOMPurify is loaded globally via CDN on admin, not on public pages
      // Sanitize using basic regex strip for XSS safety
      const sanitized = announcement.content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/javascript\s*:/gi, '');
      contentEl.innerHTML = sanitized + renderLinkPreview(announcement.preview);
    }

    // Update OG meta
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${announcement.title} | KGED`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && announcement.content) {
      ogDesc.setAttribute('content', announcement.content.replace(/<[^>]*>/g, '').slice(0, 160));
    }
  } catch (err) {
    console.warn('[KGED] Duyuru detay hydration hatası:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnnouncementDetail);
} else {
  initAnnouncementDetail();
}

import fs from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/site-content.json');
const TURKEY_LABEL = 'Türkiye';

function readSiteContent() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (err) {
    console.error('[KGED] site-content.json okunamadı:', err.message);
    throw new Error('site-content.json okunamadı veya bozuk. Lütfen dosyayı kontrol edin.');
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

function escapeAttr(value) { return escapeHtml(value); }

function slugify(text) {
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
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) + '...';
}

function ensureLeadingSlash(value) {
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
}

function stripTrailingSlash(value) {
  if (!value || value === '/') return '/';
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function toAbsoluteUrl(siteUrl, target) {
  if (!target) return null;
  if (/^(https?:\/\/|tel:|mailto:|#)/i.test(target)) return target;
  return new URL(ensureLeadingSlash(target), `${siteUrl.replace(/\/$/, '')}/`).toString();
}

function renderLinkPreview(preview) {
  if (!preview || !preview.url) return '';
  return `
    <div class="link-preview-card">
      <a href="${escapeAttr(preview.url)}" target="_blank" rel="noopener noreferrer" class="link-preview-link" title="${escapeAttr(preview.title)}">
        <div class="link-preview-grid">
          ${preview.image ? `
          <div class="link-preview-image-wrap">
            <img src="${escapeAttr(preview.image)}" alt="" class="link-preview-image" loading="lazy" />
          </div>` : ''}
          <div class="link-preview-content">
            <span class="link-preview-site">${escapeHtml(preview.siteName || 'Harici Haber')}</span>
            <h3 class="link-preview-title">${escapeHtml(preview.title)}</h3>
            <p class="link-preview-desc">${escapeHtml(preview.description)}</p>
            <div class="link-preview-footer">
               <span>Kaynak: ${new URL(preview.url).hostname}</span>
               <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`;
}

function getPagePath(pageKey) {
  const paths = {
    index: '/',
    hakkimizda: '/hakkimizda',
    galeri: '/galeri',
    duyurular: '/duyurular',
    tuzuk: '/tuzuk',
    iletisim: '/iletisim',
    notfound: '/404.html',
  };
  if (pageKey.startsWith('announcement:')) {
    return `/duyurular/${pageKey.split(':')[1]}`;
  }
  return paths[pageKey] || '/';
}

function getPageMeta(pageKey, content) {
  if (pageKey === 'notfound') {
    return {
      title: `Sayfa Bulunamadı | ${content.site.name}`,
      description: 'Aradığınız sayfa bulunamadı. Ana sayfaya dönerek devam edebilirsiniz.',
      canonical: null, robots: 'noindex, nofollow', breadcrumbs: null,
      webPageName: `Sayfa Bulunamadı | ${content.site.name}`,
      webPageDescription: '404 hata sayfası.',
    };
  }

  if (pageKey.startsWith('announcement:')) {
    const slug = pageKey.split(':')[1];
    const ann = content.announcements.find(a => slugify(a.title) === slug);
    const title = ann ? `${ann.title} | Duyurular` : 'Duyuru Detayı';
    const desc = ann ? (ann.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...') : 'KGED duyuru detayı.';
    return {
      title: `${title} | ${content.site.name}`,
      description: desc,
      canonical: toAbsoluteUrl(content.site.url, `/duyurular/${slug}`),
      robots: null,
      breadcrumbs: [
        { name: 'Ana Sayfa', item: toAbsoluteUrl(content.site.url, '/') },
        { name: 'Duyurular', item: toAbsoluteUrl(content.site.url, '/duyurular') },
        { name: ann?.title || 'Duyuru', item: toAbsoluteUrl(content.site.url, `/duyurular/${slug}`) },
      ],
      webPageName: title,
      webPageDescription: desc,
    };
  }

  const seoEntry = content.seo[pageKey] || {};
  const pageNames = {
    index: 'Ana Sayfa',
    hakkimizda: content.about?.title || 'Hakkımızda',
    galeri: 'Galeri & Aktiviteler',
    duyurular: 'Duyurular & Haberler',
    tuzuk: content.constitution?.title || 'Tüzük',
    iletisim: 'İletişim',
  };

  const title = pageKey === 'index' ? 'Kırşehir Görme Engelliler Derneği | KİRGED' : (seoEntry.title || pageNames[pageKey] || content.site.name);
  const description = pageKey === 'index' ? 'Kırşehir Görme Engelliler Derneği (KİRGED) resmi web sitesi. Kırşehir görme engelliler ve az gören bireyler için eğitim, toplumsal destek, istihdam ve sosyal faaliyetler yürütmekteyiz.' : (seoEntry.description || content.site.description || '');

  return {
    title: pageKey === 'index' ? title : `${title} | ${content.site.name}`,
    description: description,
    canonical: toAbsoluteUrl(content.site.url, seoEntry.canonical || getPagePath(pageKey)),
    robots: null,
    breadcrumbs: pageKey === 'index' ? null : [
      { name: 'Ana Sayfa', item: toAbsoluteUrl(content.site.url, '/') },
      { name: pageNames[pageKey] || pageKey, item: toAbsoluteUrl(content.site.url, getPagePath(pageKey)) },
    ],
    webPageName: title,
    webPageDescription: description,
  };
}

function icon(name) {
  const icons = {
    accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/><text x="12" y="14" fill="currentColor" opacity="0.6" font-size="10px" font-weight="bold" font-family="sans-serif" text-anchor="middle" alignment-baseline="middle">@</text></svg>',
    phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>',
    map: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    chat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    scale: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    menuOpen: '<svg class="menu-toggle__open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    menuClose: '<svg class="menu-toggle__close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    contrast: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/></svg>',
    grayscale: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    dyslexia: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    reset: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>',
    text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    chevronUp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>',
    chevronDown: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
    external: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:0.85em;height:0.85em;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    directions: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>',
    twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.5-1.119-2.5-2.5c0-1.38 1.11-2.5 2.5-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  };
  return icons[name] ?? '';
}

function renderThemeBootstrap() {
  return `<script>(function(){var theme=localStorage.getItem('kged-theme');var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',theme||system);var fontSize=parseInt(localStorage.getItem('kged-font-size'),10);if(!isNaN(fontSize)&&fontSize!==100)document.documentElement.style.fontSize=fontSize+'%';})();<\/script>`;
}

function renderNavLinks(items, currentPath, className, content) {
  return items.map((item) => {
    const href = toAbsoluteUrl(content.site.url, item.href);
    const isCurrent = (stripTrailingSlash(ensureLeadingSlash(item.href)) === stripTrailingSlash(currentPath)) ||
      (item.children && item.children.some(c => stripTrailingSlash(ensureLeadingSlash(c.href)) === stripTrailingSlash(currentPath)));
    const currentAttr = isCurrent ? ' aria-current="page"' : '';

    if (item.children && item.children.length > 0) {
      const dropdownHtml = item.children.map(child => {
        const childHref = toAbsoluteUrl(content.site.url, child.href);
        const isChildCurrent = stripTrailingSlash(ensureLeadingSlash(child.href)) === stripTrailingSlash(currentPath);
        return `<a href="${escapeAttr(childHref)}" title="${escapeAttr(child.label)}" class="nav__dropdown-link"${isChildCurrent ? ' aria-current="page"' : ''}>${escapeHtml(child.label)}</a>`;
      }).join('');

      return `<div class="nav__item nav__item--has-dropdown">
        <a href="${escapeAttr(href)}" title="${escapeAttr(item.label)}" class="${className}"${currentAttr} role="button" aria-haspopup="true" aria-expanded="false">
          ${escapeHtml(item.label)}
          <span class="nav__dropdown-icon" aria-hidden="true">${icon('chevronDown') || '▾'}</span>
        </a>
        <div class="nav__dropdown">
          <div class="nav__dropdown-inner">
            ${dropdownHtml}
          </div>
        </div>
      </div>`;
    }

    return `<a href="${escapeAttr(href)}" title="${escapeAttr(item.label)}" class="${className}"${currentAttr}>${escapeHtml(item.label)}</a>`;
  }).join('\n');
}

function renderHeader(content, currentPath, options = {}) {
  const logoMarkup = content.site.status.hasLogo && content.site.logoPath
    ? `<img src="${escapeAttr(content.site.logoPath)}" alt="Kırşehir Görme Engelliler Derneği Logosu" class="header__logo-image" aria-hidden="true" />`
    : `<div class="header__logo-icon" aria-hidden="true">${icon('eye')}</div>`;

  const socialLinks = Object.entries(content.contact.social || {}).filter(([k, v]) => Boolean(v));
  const socialMarkup = socialLinks.length > 0
    ? socialLinks.map(([platform, href]) => `<a href="${escapeAttr(href)}" title="${escapeAttr(platform)}" class="top-bar__social-link" target="_blank" rel="nofollow noopener noreferrer" aria-label="${escapeAttr(platform)} profilimiz">${icon(platform)}</a>`).join('')
    : '';

  const topBarHtml = `<div class="top-bar">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
      <div class="top-bar__left">
        <div class="top-bar__item">${icon('phone')} <a href="${escapeAttr(content.contact.phoneHref)}" title="${escapeAttr(content.contact.phone)}">${escapeHtml(content.contact.phone)}</a></div>
        <div class="top-bar__item">${icon('mail')} <a href="${escapeAttr(content.contact.emailHref)}" title="${escapeAttr(content.contact.email)}">${escapeHtml(content.contact.email)}</a></div>
      </div>
      <div class="top-bar__right">
        ${socialMarkup ? `<div class="top-bar__socials">${socialMarkup}</div>` : ''}
      </div>
    </div>
  </div>`;

  const mid = Math.ceil(content.nav.length / 2);
  const leftNav = content.nav.slice(0, mid);
  const rightNav = content.nav.slice(mid);

  return `<div class="header-wrapper">
    ${topBarHtml}
    <header class="header" role="banner">
      <div class="container header__inner">
        
        <nav class="nav--desktop header__nav-left" aria-label="Ana menü sol">
          ${renderNavLinks(leftNav, currentPath, 'nav__link', content)}
        </nav>

        <a href="${toAbsoluteUrl(content.site.url, '/')}" class="header__logo header__logo-center" aria-label="${escapeAttr(`${content.site.name} — Ana Sayfa`)}" title="${escapeAttr(`${content.site.name} Ana Sayfa`)}">
          <div class="header__logo-bg">
            ${logoMarkup}
          </div>
        </a>

        <nav class="nav--desktop header__nav-right" aria-label="Ana menü sağ">
          ${renderNavLinks(rightNav, currentPath, 'nav__link', content)}
        </nav>

        <div class="header__actions mobile-only">
          <button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menüyü genişlet/daralt" title="Menü">
            <span class="sr-only">Menü</span>
            ${icon('menuOpen')}
            ${icon('menuClose')}
          </button>
        </div>
      </div>
    </header>
  </div>`;
}

function renderMobileNav(content, currentPath, options = {}) {
  const showCta = options.showCta !== false;
  const ctaMarkup = showCta
    ? `<div style="margin-top: 1rem;">
      <a href="${toAbsoluteUrl(content.site.url, content.hero.cta.primary.href)}" class="btn btn--primary" style="width:100%;justify-content:center;" title="${escapeAttr(content.hero.cta.primary.label)}">
        ${icon('phone')} ${escapeHtml(content.hero.cta.primary.label)}
      </a>
    </div>` : '';
  return `<nav class="nav--mobile" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobil menü">
    ${renderNavLinks(content.nav, currentPath, 'nav__link', content)}
    ${ctaMarkup}
  </nav>`;
}

function renderWhatsAppFloat(content) {
  if (!content.contact.whatsappHref) return '';
  return `<a href="${escapeAttr(content.contact.whatsappHref)}" class="whatsapp-float" aria-label="WhatsApp'tan bize ulaşın" target="_blank" rel="nofollow noopener noreferrer" title="WhatsApp İletişim">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
  </a>`;
}

function renderFooter(content, options = {}) {
  const isMinimal = options.minimal === true;
  const navMarkup = renderNavLinks(content.nav, '', 'footer__link', content);
  const addressMarkup = content.site.status.hasAddress && content.contact.address?.short
    ? `<p class="footer__contact-row">${icon('map')}<a href="${toAbsoluteUrl(content.site.url, content.contact.googleMapsUrl)}" target="_blank" rel="nofollow noopener noreferrer" style="color:var(--color-primary-200);" title="Haritada Görüntüle">${escapeHtml(content.contact.address.short)}</a></p>`
    : '';

  const socialLinks = Object.entries(content.contact.social || {}).filter(([k, v]) => Boolean(v));
  const sameAsMarkup = socialLinks.length > 0
    ? socialLinks.map(([platform, href]) => `<a href="${escapeAttr(href)}" class="footer__link" target="_blank" rel="nofollow noopener noreferrer" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:rgba(255,255,255,0.1); border-radius:50%; margin-right:0.25rem;" aria-label="${escapeAttr(platform)} profilimiz" title="${escapeAttr(platform)}">${icon(platform) || escapeHtml(new URL(href).hostname.replace('www.', ''))}</a>`).join('')
    : '';

  if (isMinimal) {
    return `<footer class="footer" role="contentinfo" style="background:var(--color-primary-900); color:white;">
      <div class="container">
        <div class="footer__bottom" style="border-top:none; padding-top: 0;">
          <p class="footer__copy" style="color:rgba(255,255,255,0.6);">© <span class="footer-year-display"></span> ${escapeHtml(content.site.name)}.</p>
          <nav aria-label="404 hızlı navigasyon"><div style="display:flex; gap: 1rem; flex-wrap: wrap;">${navMarkup}</div></nav>
        </div>
      </div>
    </footer>`;
  }

  return `<footer class="footer" role="contentinfo" style="background:var(--color-primary-900); color:white;">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <p class="footer__brand-name" style="color:var(--color-accent-400);">${escapeHtml(content.site.name)}</p>
          <p class="footer__brand-desc" style="color:var(--color-primary-200);">${escapeHtml(content.footer.description)}</p>
          ${sameAsMarkup ? `<div style="display:flex; gap: 0.75rem; flex-wrap: wrap; margin-top: var(--space-4);">${sameAsMarkup}</div>` : ''}
        </div>
        <nav aria-label="Hızlı bağlantılar">
          <p class="footer__heading" style="color:var(--color-accent-400);">Hızlı Menü</p>
          <ul class="footer__links">
            ${content.nav.map((item) => `<li><a href="${toAbsoluteUrl(content.site.url, item.href)}" title="${escapeAttr(item.label)}" class="footer__link" style="color:var(--color-primary-200);">${escapeHtml(item.label)}</a></li>`).join('')}
          </ul>
        </nav>
        <nav aria-label="Kurumsal bağlantılar">
          <p class="footer__heading" style="color:var(--color-accent-400);">Kurumsal</p>
          <ul class="footer__links">
            <li><a href="${toAbsoluteUrl(content.site.url, '/hakkimizda')}" title="Derneğimiz Hakkında" class="footer__link" style="color:var(--color-primary-200);">Derneğimiz Hakkında</a></li>
            <li><a href="${toAbsoluteUrl(content.site.url, '/tuzuk')}" title="Dernek Tüzüğü" class="footer__link" style="color:var(--color-primary-200);">Dernek Tüzüğü</a></li>
            <li><a href="${toAbsoluteUrl(content.site.url, '/iletisim')}" title="İletişim & Konum" class="footer__link" style="color:var(--color-primary-200);">İletişim & Konum</a></li>
            <li><a href="${toAbsoluteUrl(content.site.url, '/admin/')}" title="Yönetici Girişi" rel="nofollow" class="footer__link" style="opacity: 0.6; color:var(--color-primary-200);">Yönetici Girişi</a></li>
          </ul>
        </nav>
        <div>
          <p class="footer__heading" style="color:var(--color-accent-400);">İletişim</p>
          <address class="footer__contact-info" style="font-style: normal;">
            <p class="footer__contact-row">${icon('phone')}<a href="${escapeAttr(content.contact.phoneHref)}" style="color:var(--color-primary-200);">${escapeHtml(content.contact.phone)}</a></p>
            <p class="footer__contact-row">${icon('mail')}<a href="${escapeAttr(content.contact.emailHref)}" style="font-size:0.8rem; word-break:break-all; color:var(--color-primary-200);">${escapeHtml(content.contact.email)}</a></p>
            ${addressMarkup}
          </address>
        </div>
      </div>
      <div class="footer__bottom" style="border-top-color:rgba(255,255,255,0.1);">
        <p class="footer__copy" style="color:rgba(255,255,255,0.6);">
          © <span id="footer-year" class="footer-year-display"></span> ${escapeHtml(content.site.name)}. Tüm hakları saklıdır.
          
        </p>
        <a href="#main-content" id="back-to-top-footer" class="btn btn--secondary btn--sm" style="font-size: 0.8rem; color:white; border-color:white;" title="Başa Dön">${icon('chevronUp')}Başa Dön</a>
      </div>
    </div>
  </footer>`;
}

function renderToolbar() {
  return `<div class="toolbar" role="complementary" aria-label="Erişilebilirlik araç çubuğu">
    <button id="toolbar-toggle" class="toolbar__toggle" aria-expanded="false" aria-controls="toolbar-panel" aria-label="Erişilebilirlik araç çubuğunu aç" title="Erişilebilirlik Araçları">${icon('accessibility')}</button>
    <div id="toolbar-panel" class="toolbar__panel" role="group" aria-label="Erişilebilirlik seçenekleri">
      <p class="toolbar__header">Erişilebilirlik</p>
      <div class="font-size-display">
        <span class="toolbar-btn" style="flex:1; pointer-events:none;">${icon('text')}Yazı Boyutu</span>
        <span id="toolbar-font-value" class="font-size-value">100%</span>
        <div class="font-size-controls">
          <button id="toolbar-font-decrease" aria-label="Yazı boyutunu küçült" title="Küçült">A−</button>
          <button id="toolbar-font-increase" aria-label="Yazı boyutunu büyüt" title="Büyüt">A+</button>
        </div>
      </div>

      <button id="toolbar-hc" class="toolbar-btn" data-theme-toggle="high-contrast" aria-pressed="false" aria-label="Yüksek kontrast modu aç/kapat">${icon('contrast')}Yüksek Kontrast</button>
      <button id="toolbar-grayscale" class="toolbar-btn" aria-pressed="false" aria-label="Gri ton modunu aç/kapat">${icon('grayscale')}Gri Ton</button>
      <button id="toolbar-dyslexia" class="toolbar-btn" aria-pressed="false" aria-label="Disleksi dostu fontu aç/kapat">${icon('dyslexia')}Disleksi Fontu</button>
      <div class="toolbar__reset">
        <button id="toolbar-reset" class="toolbar-btn" aria-label="Tüm erişilebilirlik ayarlarını sıfırla">${icon('reset')}Sıfırla</button>
      </div>
    </div>
  </div>`;
}

function renderBackToTop() {
  return `<button id="back-to-top" aria-label="Sayfanın başına dön" title="Başa Dön">${icon('chevronUp')}</button>`;
}

function renderLoader(content) {
  return `<div id="loader" aria-hidden="true" role="presentation">
    <div class="loader__brand">
      <div class="loader__eye" aria-hidden="true">
        <div class="loader__eye-outer"></div>
        <div class="loader__eye-ring"></div>
        <div class="loader__eye-dot"></div>
      </div>
      <p class="loader__name">${escapeHtml(content.site.name)}</p>
      <p class="loader__tagline">${escapeHtml(content.site.slogan)}</p>
    </div>
    <div class="loader__progress" aria-hidden="true"><div class="loader__progress-bar"></div></div>
  </div>`;
}

function renderSkipLink() { return '<a class="skip-link" href="#main-content" title="İçeriğe atla">İçeriğe atla</a>'; }

function renderSectionHeader(title, lead, id) {
  return `<div class="section__header">
    <div class="section-accent" aria-hidden="true"></div>
    <h2 class="section__title"${id ? ` id="${escapeAttr(id)}"` : ''}>${escapeHtml(title)}</h2>
    ${lead ? `<p class="section__lead">${escapeHtml(lead)}</p>` : ''}
  </div>`;
}

function renderIndexContent(content) {
  const locationLabel = content.hero.locationLabel || [content.contact.address?.city, TURKEY_LABEL].filter(Boolean).join(', ');
  const missionCards = content.mission.cards.map((card, index) => `
    <article class="card" aria-labelledby="mission-${index + 1}-title">
      <div class="card__icon" aria-hidden="true">${icon(card.icon)}</div>
      <h3 class="card__title" id="mission-${index + 1}-title">${escapeHtml(card.title)}</h3>
      <p class="card__text">${escapeHtml(card.text)}</p>
    </article>`).join('');

  const arrowRightIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`;

  const staggeredGridHtml = `
    <div class="staggered-layout">
      <div class="staggered-layout__bg" aria-hidden="true"></div>
      <div class="staggered-grid" role="list">
        <a href="${toAbsoluteUrl(content.site.url, content.contact.phoneHref)}" class="feature-card" role="listitem" aria-label="Telefon et: ${escapeAttr(content.contact.phone)}" title="Telefon Görüşmesi">
          <div class="feature-card__icon" aria-hidden="true">${icon('phone')}</div>
          <h3 class="feature-card__title">Telefon Görüşmesi</h3>
          <p class="feature-card__text">Mesai saatleri içerisinde bizimle doğrudan telefon aracılığıyla iletişime geçebilirsiniz.</p>
          <div class="feature-card__link">Hemen Ara ${arrowRightIcon}</div>
        </a>
        ${content.contact.googleMapsUrl ? `
        <a href="${toAbsoluteUrl(content.site.url, content.contact.googleMapsUrl)}" class="feature-card" role="listitem" aria-label="Haritada göster, yeni sekmede açılır" target="_blank" rel="nofollow noopener noreferrer" title="Yerinde Ziyaret">
          <div class="feature-card__icon" aria-hidden="true">${icon('map')}</div>
          <h3 class="feature-card__title">Yerinde Ziyaret</h3>
          <p class="feature-card__text">Kırşehir merkezdeki dernek ofisimize uğrayarak çalışmalarımızla ilgili birebir bilgi alabilirsiniz.</p>
          <div class="feature-card__link">Konumu Bul ${arrowRightIcon}</div>
        </a>` : ''}
        <a href="${toAbsoluteUrl(content.site.url, content.hero.cta.primary.href)}" class="feature-card" role="listitem" aria-label="İletişim sayfasına git" title="İletişim Formu">
          <div class="feature-card__icon" aria-hidden="true">${icon('chat')}</div>
          <h3 class="feature-card__title">İletişim Formu</h3>
          <p class="feature-card__text">Kapsamlı sorularınız, bağış konuları veya kurumsal iş birlikleri için iletişim sayfamızı kullanabilirsiniz.</p>
          <div class="feature-card__link">Sayfaya Git ${arrowRightIcon}</div>
        </a>
        <a href="${toAbsoluteUrl(content.site.url, content.contact.emailHref)}" class="feature-card" role="listitem" aria-label="E-posta gönder" title="E-posta Gönderimi">
          <div class="feature-card__icon" aria-hidden="true">${icon('mail')}</div>
          <h3 class="feature-card__title">E-posta Gönderimi</h3>
          <p class="feature-card__text">Resmi yazışmalar veya belge aktarımı için kurumsal e-posta adresimiz üzerinden bize ulaşabilirsiniz.</p>
          <div class="feature-card__link">Mail At ${arrowRightIcon}</div>
        </a>
      </div>
    </div>`;

  return `<section class="hero" aria-labelledby="live-hero-title" style="background: linear-gradient(rgba(10, 27, 53, 0.75), rgba(10, 27, 53, 0.95)), url('/assets/images/hero-bg.jpg') center/cover no-repeat; text-align: center; padding-block: 8rem;">
    <div class="container hero__inner" style="grid-template-columns: 1fr;">
      <div class="hero__content" style="max-width: 900px; margin-inline: auto;">
        <div class="hero__badge" aria-hidden="true" style="margin-inline:auto; background:rgba(232, 184, 75, 0.15); border-color:#e8b84b; color:#e8b84b; padding: 0.5rem 1rem;">${icon('map')}Kırşehir, Türkiye</div>
        <h1 class="hero__title" id="live-hero-title">Kırşehir Görme Engelliler Derneği</h1>
        <p class="hero__subtitle" id="live-hero-subtitle" style="color:var(--color-accent-400);">Kırşehir görme engelliler için eşit, engelsiz ve erişilebilir bir yaşam.</p>
        <p class="hero__lead" id="live-hero-lead" style="margin-inline:auto;">Derneğimiz (KİRGED), Kırşehir'deki görme engelli vatandaşlarımızın sosyal hayata tam katılımını sağlamak, dayanışmayı güçlendirmek ve farkındalık yaratmak amacıyla çalışmalarını sürdürmektedir.</p>
        <div class="hero__actions" style="justify-content:center;">
          <a href="${toAbsoluteUrl(content.site.url, content.hero.cta.primary.href)}" class="btn btn--accent btn--lg" id="hero-cta-primary" title="Bize Ulaşın">${icon('phone')}<span id="live-hero-cta-label">Bize Ulaşın</span></a>
          <a href="${toAbsoluteUrl(content.site.url, content.hero.cta.secondary.href)}" class="btn btn--secondary btn--lg" id="hero-cta-secondary" style="border-color: rgba(255,255,255,0.4); color: #fff; background: rgba(255,255,255,0.05);" title="Hakkımızda">${icon('info')}Hakkımızda</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="mission-heading">
    <div class="container">
      ${renderSectionHeader(content.mission.title, content.mission.lead)}
      <div class="grid-3">${missionCards}</div>
    </div>
  </section>

  <section class="section" aria-labelledby="quicklinks-heading">
    <div class="container">
      ${renderSectionHeader('Bize Kolayca Ulaşın', 'Derneğimizle iletişime geçmek veya lokasyonumuzu öğrenmek için aşağıdaki yolları kullanabilirsiniz.')}
    </div>
    ${staggeredGridHtml}
  </section>

  <section class="section section--alt" aria-labelledby="contact-summary-heading">
    <div class="container">
      <div style="max-width: 640px; margin-inline: auto; text-align: center;">
        <div class="section-accent" aria-hidden="true" style="margin-inline: auto;"></div>
        <h2 class="section__title" id="contact-summary-heading">Bize Ulaşın</h2>
        <p class="section__lead" style="margin-bottom: 2rem;">Sorularınız için aşağıdaki kanallardan bize ulaşabilirsiniz.</p>
      </div>
      <div class="grid-2" style="max-width: 640px; margin-inline: auto;">
        <article class="contact-item" aria-label="Telefon iletişim bilgisi">
          <div class="contact-item__icon" aria-hidden="true">${icon('phone')}</div>
          <div>
            <p class="contact-item__label">Telefon</p>
            <p class="contact-item__value"><a href="${toAbsoluteUrl(content.site.url, content.contact.phoneHref)}" title="${escapeAttr(content.contact.phone)}">${escapeHtml(content.contact.phone)}</a></p>
          </div>
        </article>
        <article class="contact-item" aria-label="E-posta iletişim bilgisi">
          <div class="contact-item__icon" aria-hidden="true">${icon('mail')}</div>
          <div>
            <p class="contact-item__label">E-posta</p>
            <p class="contact-item__value" style="font-size:0.8rem;"><a href="${toAbsoluteUrl(content.site.url, content.contact.emailHref)}" title="${escapeAttr(content.contact.email)}">${escapeHtml(content.contact.email)}</a></p>
          </div>
        </article>
      </div>
    </div>
  </section>`;
}

function renderAboutContent(content) {
  const goals = content.about.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('');

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">${escapeHtml(content.about.title)}</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="live-about-page-title">${escapeHtml(content.about.title)}</h1>
      <p class="page-header__lead" id="live-about-page-lead">${escapeHtml(content.about.pageLead || 'Görme engelli bireylerin yanında, her zaman.')}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="intro-heading">
    <div class="container">
      <div style="max-width: 800px; margin-inline: auto;">
        <div class="section-accent" aria-hidden="true"></div>
        <h2 id="live-about-intro-heading" style="font-size: var(--text-3xl); margin-bottom: var(--space-6);">${escapeHtml(content.about.introHeading || 'Biz Kimiz?')}</h2>
        <p id="misyon" style="font-size: var(--text-lg); line-height: var(--leading-loose); color: var(--color-text-muted); margin-bottom: var(--space-6);">${escapeHtml(content.about.intro)}</p>
        <p id="live-about-description" style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--color-text-muted); margin-bottom: var(--space-6);">${escapeHtml(content.about.description)}</p>
        <div class="alert alert--info" role="note" aria-label="Kuruluş bilgisi">
          ${icon('calendar')}
          <span>${escapeHtml(content.about.foundingStatus)}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="goals-heading">
    <div class="container">
      <div style="max-width: 800px; margin-inline: auto;" id="vizyon">
        <div class="section-accent" aria-hidden="true"></div>
        <h2 id="goals-heading" style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">${escapeHtml(content.about.goalsHeading || 'Amaçlarımız')}</h2>
        <p style="font-size: var(--text-base); color: var(--color-text-muted); margin-bottom: var(--space-8); line-height: var(--leading-relaxed);">${escapeHtml(content.about.goalsLead || 'Görme engelli bireylere yönelik aşağıdaki hedefler doğrultusunda faaliyet göstermekteyiz:')}</p>
        <ul class="goal-list" aria-label="Dernek amaçları">${goals}</ul>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="board-heading">
    <div class="container">
      <div style="max-width: 800px; margin-inline: auto;">
        <div class="section-accent" aria-hidden="true"></div>
        <h2 id="board-heading" style="font-size: var(--text-3xl); margin-bottom: var(--space-6);">${escapeHtml(content.about.boardHeading || 'Yönetim Kurulu')}</h2>
        <div id="live-board-container">
          ${content.board && content.board.length > 0
      ? `<div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);padding:var(--space-6);box-shadow:var(--shadow-sm);">
                <ul style="list-style:none;padding:0;margin:0;display:grid;gap:var(--space-4);">
                  ${content.board.map((member, idx) => `
                    <li style="display:flex;align-items:center;gap:var(--space-4);padding-bottom:${idx === content.board.length - 1 ? '0' : 'var(--space-4)'};border-bottom:${idx === content.board.length - 1 ? 'none' : '1px solid var(--color-border)'};">
                      <div style="width:40px;height:40px;background:var(--color-primary-100);color:var(--color-primary-700);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${idx + 1}</div>
                      <div style="flex:1;">
                        <p style="font-weight:600;color:var(--color-text);margin-bottom:0.25rem;">${escapeHtml(member.name)}</p>
                        <p style="font-size:0.85rem;color:var(--color-text-muted);">${escapeHtml(member.role)}</p>
                      </div>
                    </li>`).join('')}
                </ul>
               </div>`
      : `<div class="status-banner" role="status" aria-live="polite"><p>${escapeHtml(content.about.boardStatus)}</p></div>`
    }
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="cta-heading">
    <div class="container" style="text-align: center;">
      <div class="section-accent" aria-hidden="true" style="margin-inline: auto;"></div>
      <h2 id="cta-heading" class="section__title">${escapeHtml(content.about.ctaTitle || 'Bizimle İletişime Geçin')}</h2>
      <p class="section__lead" style="margin-bottom: var(--space-8);">${escapeHtml(content.about.ctaLead || 'Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın.')}</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="${toAbsoluteUrl(content.site.url, '/iletisim')}" class="btn btn--primary btn--lg" id="about-cta" title="${escapeAttr(content.about.ctaPrimaryLabel || 'İletişim Sayfası')}">${icon('phone')}${escapeHtml(content.about.ctaPrimaryLabel || 'İletişim Sayfası')}</a>
        <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--secondary btn--lg" id="about-phone">${escapeHtml(content.about.ctaSecondaryLabel || `Hemen Ara: ${content.contact.phone}`)}</a>
      </div>
    </div>
  </section>`;
}

function renderGalleryContent(content) {
  const galleryConfig = content.gallery || {};
  const catLabels = { etkinlik: 'Etkinlik', toplanti: 'Toplantı', egitim: 'Eğitim', ziyaret: 'Ziyaret', diger: 'Diğer' };
  const catColors = { etkinlik: 'var(--color-primary-600)', toplanti: '#16A34A', egitim: '#D97706', ziyaret: '#0891B2', diger: '#6B7280' };

  const categoryFilters = Object.entries(catLabels).map(([key, label]) =>
    `<button class="gallery-filter-btn" data-filter="${key}" onclick="filterGallery(this, '${key}')">${escapeHtml(label)}</button>`
  ).join('');

  const galleryStyles = `
    <style>
      .gallery-page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-6); }
      .gallery-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow var(--transition-normal), transform var(--transition-normal); }
      .gallery-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
      .gallery-card__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; background: var(--color-surface); }
      .gallery-card__img-placeholder { width: 100%; aspect-ratio: 4/3; background: var(--color-surface); display: flex; align-items: center; justify-content: center; color: var(--color-text-faint); }
      .gallery-card__body { padding: var(--space-4); }
      .gallery-card__cat { display: inline-block; padding: 2px 10px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-semibold); margin-bottom: var(--space-2); color: white; }
      .gallery-card__title { font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--color-text); margin-bottom: var(--space-1); }
      .gallery-card__date { font-size: var(--text-xs); color: var(--color-text-faint); display: flex; align-items: center; gap: 4px; }
      .gallery-filter-bar { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-8); align-items: center; }
      .gallery-filter-btn { padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); border: 2px solid var(--color-border); background: transparent; font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-muted); cursor: pointer; transition: all var(--transition-fast); }
      .gallery-filter-btn:hover, .gallery-filter-btn.active { border-color: var(--color-primary-500); background: var(--color-primary-50); color: var(--color-primary-700); }
      .gallery-empty { text-align: center; padding: var(--space-20); color: var(--color-text-muted); }
      .gallery-empty svg { width: 64px; height: 64px; color: var(--color-text-faint); margin-inline: auto; margin-bottom: var(--space-4); display: block; }
      .gallery-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: none; align-items: center; justify-content: center; padding: var(--space-8); }
      .gallery-lightbox.open { display: flex; }
      .gallery-lightbox img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: var(--radius-lg); transition: opacity 200ms ease; }
      .gallery-lightbox-close { position: absolute; top: var(--space-6); right: var(--space-6); background: rgba(255,255,255,0.1); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; transition: background var(--transition-fast); }
      .gallery-lightbox-close:hover { background: rgba(255,255,255,0.2); }
      .gallery-lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background var(--transition-fast); }
      .gallery-lightbox-nav:hover { background: rgba(255,255,255,0.2); }
      .gallery-lightbox-nav.prev { left: var(--space-6); }
      .gallery-lightbox-nav.next { right: var(--space-6); }
      .gallery-lightbox-caption { position: absolute; bottom: var(--space-6); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-size: var(--text-sm); text-align: center; white-space: nowrap; transition: opacity 200ms ease; }
      
      
      .gallery-album-wrap { grid-column: 1 / -1; display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-4); }
      .gallery-album-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; user-select: none; transition: background var(--transition-fast); }
      .gallery-album-header:hover { background: var(--color-bg-card); }
      .gallery-album-title { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-text); display: flex; align-items: center; gap: var(--space-2); }
      .gallery-album-badge { font-size: var(--text-xs); background: var(--color-primary-100); color: var(--color-primary-700); padding: 2px 8px; border-radius: var(--radius-full); font-weight: var(--weight-semibold); }
      .gallery-album-icon { transition: transform 300ms ease; }
      .gallery-album-wrap.expanded .gallery-album-icon { transform: rotate(180deg); }
      .gallery-album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-6); overflow: hidden; display: none; }
      .gallery-album-wrap.expanded .gallery-album-grid { display: grid; animation: fadeInDown 300ms ease forwards; }
      
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>`;

  return `${galleryStyles}
  <section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">Galeri</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">${escapeHtml(galleryConfig.title || 'Galeri & Aktiviteler')}</h1>
      <p class="page-header__lead">${escapeHtml(galleryConfig.pageLead || 'Derneğimizin etkinlikleri ve faaliyetlerinden kareler.')}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="gallery-heading">
    <div class="container">
      <div class="gallery-filter-bar" role="toolbar" aria-label="Galeri filtreleri">
        <button class="gallery-filter-btn active" onclick="filterGallery(this, 'all')">Tümü</button>
        ${categoryFilters}
      </div>
      <div class="gallery-page-grid" id="gallery-page-grid" aria-live="polite">
        <div class="gallery-empty-state" style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; color: var(--color-text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🍃</div>
          <p style="font-size: var(--text-lg); font-weight: 500;">Galeri boş ise şimdilik etraf sakin...</p>
          <p style="font-size: var(--text-sm); opacity: 0.8; margin-top: 0.5rem;">Etkinliklerimizi yakında burada bulabilirsiniz.</p>
        </div>
      </div>
    </div>
  </section>

  <div id="gallery-lightbox" class="gallery-lightbox" tabindex="-1" role="dialog" aria-modal="true" aria-label="Görsel büyütücü">
    <button class="gallery-lightbox-close" onclick="window.closeLightbox()" aria-label="Kapat">✕</button>
    <button class="gallery-lightbox-nav prev" id="lightbox-prev" onclick="window.navLightbox(-1)" aria-label="Önceki" style="display:none;"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
    <img id="lightbox-img" src="" alt="" />
    <button class="gallery-lightbox-nav next" id="lightbox-next" onclick="window.navLightbox(1)" aria-label="Sonraki" style="display:none;"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
    <p id="lightbox-caption" class="gallery-lightbox-caption"></p>
  </div>
`;
}

function renderConstitutionContent(content) {
  const hasConstitution = content.site.status.hasConstitution && content.constitution.pdfPath;

  const infoParagraphs = content.constitution.infoParagraphs || [
    'Dernek tüzüğü; derneğin kuruluş amacını, faaliyet alanlarını, üyelik koşullarını, yönetim yapısını ve mali esaslarını belirleyen temel belgedir. 5253 sayılı Dernekler Kanunu kapsamında hazırlanır.',
    'Tüzüğümüz yayınlandığında şu konuları kapsayacaktır: Derneğin adı ve merkezi, amaç ve faaliyet alanı, üyelik şartları, yönetim ve denetim kurulu yapısı, genel kurul esasları, mali hükümler ve fesih prosedürü.',
  ];

  const downloadSection = hasConstitution
    ? `<div style="display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:var(--space-8);">
        <a href="${escapeAttr(content.constitution.pdfPath)}" class="btn btn--primary btn--lg" download aria-label="Tüzük PDF dosyasını indir">
          ${icon('download')} Tüzüğü İndir (PDF)
        </a>
        <a href="${escapeAttr(content.constitution.pdfPath)}" class="btn btn--secondary btn--lg" target="_blank" rel="noopener noreferrer" aria-label="Tüzüğü tarayıcıda aç">
          ${icon('external')} Tarayıcıda Aç
        </a>
      </div>`
    : `<div class="alert alert--warning" role="note" style="margin-bottom:var(--space-8);">
        ${icon('info')}
        <span>${escapeHtml(content.constitution.conversionNote || 'Tüzük belgesi dijitalleştirme aşamasındadır.')}</span>
      </div>`;

  const pdfViewer = hasConstitution
    ? `<div class="constitution-viewer-wrap" style="border:1px solid var(--color-border); border-radius:var(--radius-xl); overflow:hidden; margin-bottom:var(--space-8); background:var(--color-surface); box-shadow:var(--shadow-sm);">
        <div style="background:var(--color-primary-950); padding:var(--space-3) var(--space-5); display:flex; align-items:center; justify-content:space-between; gap:var(--space-2); font-size:var(--text-sm); color:var(--color-primary-100);">
          <div style="display:flex; align-items:center; gap:var(--space-2);">
            <svg style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style="font-weight:600;">Tüzük Belgesi Görüntüleyici</span>
          </div>
          <span style="font-size: 0.75rem; opacity: 0.8;">Hızlandırmak için "İndir" butonunu kullanabilirsiniz</span>
        </div>
        <div style="position:relative; width:100%; height:700px; background:var(--color-surface); overflow: hidden;">
          <object 
            data="${escapeAttr(content.constitution.pdfPath)}#view=FitH" 
            type="application/pdf"
            width="100%" 
            height="100%" 
            style="border:none; display:block;"
          >
            <iframe 
              src="${escapeAttr(content.constitution.pdfPath)}#view=FitH" 
              title="Dernek Tüzüğü"
              width="100%" 
              height="100%" 
              style="border:none;"
            >
              <div style="padding:var(--space-10) var(--space-6); text-align:center; color:var(--color-text-muted);">
                ${icon('info')}
                <p style="margin-bottom:var(--space-4); font-weight:500;">Tarayıcınız PDF belgesini doğrudan gösteremedi.</p>
                <a href="${escapeAttr(content.constitution.pdfPath)}" class="btn btn--primary" download>Belgeyi İndir</a>
              </div>
            </iframe>
          </object>
        </div>
      </div>`
    : '';

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">${escapeHtml(content.constitution.title)}</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">${escapeHtml(content.constitution.title)}</h1>
      <p class="page-header__lead">${escapeHtml(content.constitution.pageLead || `${content.site.name}'nin resmi kuruluş belgesi ve yönetim esasları.`)}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="constitution-status-heading">
    <div class="container">
      <div style="max-width: 760px; margin-inline: auto;">
        <div class="section-accent" aria-hidden="true"></div>
        <h2 id="constitution-status-heading" style="font-size: var(--text-2xl); margin-bottom: var(--space-6);">${escapeHtml(content.constitution.sectionTitle || 'Tüzük Belgesi')}</h2>

        ${hasConstitution ? '' : `<div class="status-banner" role="status" aria-live="polite" style="margin-bottom: var(--space-6);">
          <p><strong>${escapeHtml(content.constitution.statusStrong || 'Tüzük belgesi hazırlanma aşamasındadır.')}</strong><br>${escapeHtml(content.constitution.status)}</p>
        </div>`}

        <div class="alert alert--info" role="note" style="margin-bottom: var(--space-6);">
          ${icon('info')}
          <span>${escapeHtml(content.constitution.infoBanner)}</span>
        </div>

        ${downloadSection}
        ${pdfViewer}

        <h2 id="what-is-constitution" style="font-size: var(--text-xl); margin-bottom: var(--space-4);">${escapeHtml(content.constitution.infoTitle || 'Tüzük Nedir?')}</h2>
        ${infoParagraphs.map((p, i) => `<p style="color: var(--color-text-muted); line-height: var(--leading-loose);${i < infoParagraphs.length - 1 ? ' margin-bottom: var(--space-4);' : ''}">${escapeHtml(p)}</p>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section--alt" aria-labelledby="constitution-cta-heading">
    <div class="container" style="text-align: center;">
      <div class="section-accent" aria-hidden="true" style="margin-inline: auto;"></div>
      <h2 id="constitution-cta-heading" class="section__title">${escapeHtml(content.constitution.ctaTitle || 'Tüzük Hakkında Bilgi Alın')}</h2>
      <p class="section__lead" style="margin-bottom: var(--space-8);">${escapeHtml(content.constitution.ctaLead || 'Sorularınız için bize ulaşın.')}</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="${toAbsoluteUrl(content.site.url, '/iletisim')}" class="btn btn--primary btn--lg" id="constitution-cta" title="${escapeAttr(content.constitution.ctaPrimaryLabel || 'İletişime Geç')}">${escapeHtml(content.constitution.ctaPrimaryLabel || 'İletişime Geç')}</a>
        <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--secondary btn--lg" id="constitution-phone">${escapeHtml(content.constitution.ctaSecondaryLabel || content.contact.phone)}</a>
      </div>
    </div>
  </section>`;
}

function renderAnnouncementsSidebar(announcements, content) {
  const recentAnnouncements = announcements.slice(0, 4);

  const kurumsalLinks = [
    { label: 'Dernek Tüzüğü', href: '/tuzuk', icon: 'book' },
    { label: 'Misyonumuz', href: '/hakkimizda#misyon', icon: 'heart' },
    { label: 'Vizyonumuz', href: '/hakkimizda#vizyon', icon: 'eye' },
    { label: 'Hakkımızda', href: '/hakkimizda', icon: 'info' },
    { label: 'İletişim', href: '/iletisim', icon: 'phone' }
  ];

  const recentHtml = recentAnnouncements.map(ann => `
    <a href="/duyurular#${escapeAttr(ann.title.toLowerCase().replace(/\s+/g, '-'))}" class="recent-announcement-item">
      <img src="${ann.image || '/logo.png'}" alt="" class="recent-announcement-item__img" />
      <div class="recent-announcement-item__content">
        <h4 class="recent-announcement-item__title">${escapeHtml(ann.title)}</h4>
        <span class="recent-announcement-item__date">${ann.date ? new Date(ann.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
      </div>
    </a>
  `).join('');

  return `
    <aside class="announcements-sidebar">
      <div class="sidebar-widget">
        <div class="sidebar-widget__header">Kurumsal</div>
        <nav class="sidebar-nav">
          ${kurumsalLinks.map(link => `
            <a href="${escapeAttr(link.href)}" class="sidebar-nav__link">
              ${icon(link.icon)}
              ${escapeHtml(link.label)}
            </a>
          `).join('')}
        </nav>
      </div>

      <div class="sidebar-widget">
        <div class="sidebar-widget__header">Son Duyurular</div>
        <div class="recent-announcements-list">
          ${recentHtml || '<p style="font-size:0.8rem; color:var(--color-text-muted); padding:1rem;">Yeni duyuru bulunmuyor.</p>'}
        </div>
      </div>
    </aside>
  `;
}

function renderAnnouncementsContent(content) {
  const announcements = content.announcements || [];
  const announcementsHtml = announcements.length > 0
    ? announcements.map(ann => {
      const slug = slugify(ann.title);
      return `
      <article class="announcement-card" id="${escapeAttr(slug)}">
        <div class="announcement-card__image-wrap">
          <img src="${ann.image || '/logo.png'}" alt="${escapeAttr(ann.title)}" class="announcement-card__image" loading="lazy" />
        </div>
        <div class="announcement-card__body">
          <div class="announcement-card__meta">
            <time datetime="${ann.date || ''}">${ann.date ? new Date(ann.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarih Belirtilmedi'}</time>
            ${ann.category ? `<span class="announcement-card__tag">${escapeHtml(ann.category)}</span>` : ''}
          </div>
          <h2 class="announcement-card__title">${escapeHtml(ann.title)}</h2>
          <div class="announcement-card__content typography">${stripHtml(ann.content)}</div>
          ${renderLinkPreview(ann.preview)}
          <div style="margin-top: 1.5rem;">
            <a href="${toAbsoluteUrl(content.site.url, `/duyurular/${slug}`)}" class="btn btn--secondary btn--sm" style="width:100%; justify-content:center;" title="Devamını Oku">Devamını Oku ${icon('chevronRight')}</a>
          </div>
        </div>
      </article>`;
    }).join('')
    : `<div class="empty-announcements-state">
        <div style="font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.7;">📢</div>
        <h3 style="font-size: var(--text-xl); color: var(--color-primary-900); margin-bottom: 0.5rem;">Duyuru sayfamız şimdilik sessiz...</h3>
        <p style="color: var(--color-text-muted); max-width: 40ch; margin-inline: auto;">Derneğimizden en güncel haberleri ve önemli duyuruları yakında bu alanda bulabileceksiniz.</p>
      </div>`;

  const sidebarHtml = renderAnnouncementsSidebar(announcements, content);

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">Duyurular</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">Duyurular & Haberler</h1>
      <p class="page-header__lead">Derneğimizden en güncel haberler ve duyurular.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="announcements-grid-layout">
        ${sidebarHtml}
        <div class="announcements-main">
          <div class="announcements-grid">
            ${announcementsHtml}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderContactContent(content) {
  const hasMap = Boolean(content.site.status.hasMapsEmbed);
  const mapQuery = (content.contact.geo?.lat && content.contact.geo?.lng)
    ? `${content.contact.geo.lat},${content.contact.geo.lng}`
    : content.contact.address?.full;
  const mapEmbedSrc = (hasMap && mapQuery)
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;

  const mapMarkup = hasMap
    ? `<div class="contact-map-wrapper" style="overflow:hidden; border-radius:var(--radius-xl); border:1px solid var(--color-border); position:relative; min-height:450px;">
        <iframe src="${escapeAttr(mapEmbedSrc)}" title="${escapeAttr(`${content.site.name} Konumu`)}" referrerpolicy="no-referrer-when-downgrade" style="width:100%; height:450px; border:0; display:block;"></iframe>
      </div>`
    : `<div class="map-placeholder" role="img" aria-label="Harita henüz etkin değil">
        ${icon('map')}
        <p><strong>${escapeHtml(content.contact.mapPlaceholderTitle || 'Harita yakında burada olacak.')}</strong><br>${escapeHtml(content.contact.mapPlaceholderText || '')}</p>
      </div>`;

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">İletişim</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">İletişim</h1>
      <p class="page-header__lead">${escapeHtml(content.contact.pageLead || 'Sorularınız için aşağıdaki kanallardan bize kolayca ulaşabilirsiniz.')}</p>
    </div>
  </section>

  <section class="section contact-main-section" style="position: relative; overflow: hidden; background: white;">
    <div class="container" style="position: relative; z-index: 2;">
      <div class="contact-grid-classic" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: start;">
        <div class="contact-info-col">
          <div class="section-accent"></div>
          <h2 style="font-size: var(--text-3xl); margin-bottom: var(--space-8);">İletişim Bilgilerimiz</h2>
          
          <div style="display:flex; flex-direction:column; gap:var(--space-6); margin-bottom:var(--space-10);">
            <article class="contact-item-classic">
              <div class="contact-item-classic__icon">${icon('phone')}</div>
              <div class="contact-item-classic__content">
                <span class="contact-item-classic__label">Telefon</span>
                <a href="${escapeAttr(content.contact.phoneHref)}" class="contact-item-classic__value">${escapeHtml(content.contact.phone)}</a>
              </div>
            </article>

            <article class="contact-item-classic">
              <div class="contact-item-classic__icon">${icon('mail')}</div>
              <div class="contact-item-classic__content">
                <span class="contact-item-classic__label">E-posta</span>
                <a href="${escapeAttr(content.contact.emailHref)}" class="contact-item-classic__value">${escapeHtml(content.contact.email)}</a>
              </div>
            </article>

            <article class="contact-item-classic">
              <div class="contact-item-classic__icon">${icon('map')}</div>
              <div class="contact-item-classic__content">
                <span class="contact-item-classic__label">Adres</span>
                <p class="contact-item-classic__value">${escapeHtml(content.contact.address.full)}</p>
              </div>
            </article>
          </div>

          <div class="contact-form-card" style="background: white; padding: var(--space-8); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
            <h3 style="margin-bottom: var(--space-6); display:flex; align-items:center; gap:0.75rem;">${icon('chat')} Bize Mesaj Gönderin</h3>
            <form id="contact-form" onsubmit="event.preventDefault(); alert('Mesajınız simüle edildi.');">
              <div style="display:grid; gap:var(--space-4);">
                <input type="text" placeholder="Adınız Soyadınız" required style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius-md);" />
                <input type="email" placeholder="E-Posta Adresiniz" required style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius-md);" />
                <textarea placeholder="Mesajınız" rows="4" required style="width:100%; padding:0.75rem; border:1px solid var(--color-border); border-radius:var(--radius-md); resize:vertical;"></textarea>
                <button type="submit" class="btn btn--primary">${icon('mail')} Gönder</button>
              </div>
            </form>
          </div>
        </div>

        <div class="contact-map-col">
          ${mapMarkup}
          ${content.contact.googleMapsUrl ? `
          <a href="${escapeAttr(content.contact.googleMapsUrl)}" class="btn btn--accent btn--lg" target="_blank" rel="noopener noreferrer" style="margin-top: var(--space-6); width: 100%; justify-content: center;">
            ${icon('directions')} Google Haritalar'da Aç
          </a>` : ''}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="quick-contact-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-6);">
        <div class="quick-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📞</div>
          <h4 style="margin-bottom: 0.25rem;">7/24 Telefon</h4>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Acil durumlar için bizlere her zaman ulaşabilirsiniz.</p>
        </div>
        <div class="quick-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📍</div>
          <h4 style="margin-bottom: 0.25rem;">Kolay Ulaşım</h4>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Merkezi konumumuzla toplu taşımaya çok yakınız.</p>
        </div>
        <div class="quick-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🤝</div>
          <h4 style="margin-bottom: 0.25rem;">Gönüllü Olun</h4>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Derneğimize gönüllü olarak destek verebilirsiniz.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function renderNotFoundContent(content) {
  return `<section class="section section--center" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(135deg, var(--brand-50), #fff);">
    <div class="container">
      <div style="font-family: var(--font-heading); font-size: clamp(6rem, 15vw, 10rem); font-weight: 800; line-height: 1; color: var(--brand-100); margin-bottom: 1rem; user-select: none;">404</div>
      <h1 class="section__title" style="font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 1.5rem; color: var(--brand-900);">Sayfa Bulunamadı</h1>
      <p class="section__lead" style="margin-bottom: 3rem; max-width: 600px; margin-inline: auto;">Aradığınız sayfa silinmiş, taşınmış veya henüz oluşturulmamış olabilir. Aşağıdaki bağlantıları kullanarak yolunuzu bulabilirsiniz.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="${toAbsoluteUrl(content.site.url, '/')}" class="btn btn--primary" title="Ana Sayfaya Dön">${icon('home')} Ana Sayfaya Dön</a>
        <a href="${toAbsoluteUrl(content.site.url, '/iletisim')}" class="btn btn--outline" title="Bize Bildirin">${icon('mail')} Bize Bildirin</a>
      </div>
    </div>
  </section>`;
}

function renderAnnouncementDetailPage(content, slug) {
  const announcement = content.announcements.find(a => slugify(a.title) === slug);
  if (!announcement) return renderNotFoundContent(content);

  const sidebarHtml = renderAnnouncementsSidebar(content.announcements || [], content);
  const dateStr = announcement.date ? new Date(announcement.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarih Belirtilmedi';

  return `
  <section class="page-header page-header--announcement" style="background: linear-gradient(rgba(10, 27, 53, 0.8), rgba(10, 27, 53, 0.9)), url('${announcement.image || '/logo.png'}') center/cover no-repeat;">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/')}" class="breadcrumb__link" title="Ana Sayfa">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><a href="${toAbsoluteUrl(content.site.url, '/duyurular')}" class="breadcrumb__link" title="Duyurular">Duyurular</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">Haber Detayı</span></li>
        </ol>
      </nav>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem; flex-wrap:wrap; gap:1rem;">
         <div style="display:flex; gap:1.5rem; color: rgba(255,255,255,0.7); font-size:0.9rem;">
            <button onclick="window.print()" class="btn btn--ghost btn--sm" style="color:inherit; border-color:rgba(255,255,255,0.2);">
              ${icon('download')} Yazdır
            </button>
            <a href="${toAbsoluteUrl(content.site.url, '/duyurular')}" class="btn btn--ghost btn--sm" style="color:inherit; border-color:rgba(255,255,255,0.2);" title="Duyurulara Dön">
              ${icon('chevronRight')} Geri Dön
            </a>
         </div>
      </div>
      <h1 class="page-header__title" style="max-width: 900px; margin-inline:auto;">${escapeHtml(announcement.title)}</h1>
      <div style="display:flex; justify-content:center; align-items:center; gap:1rem; margin-top:1.5rem; color:var(--color-accent-400); font-weight:600;">
         <span style="font-size:1.5rem; display:flex;">${icon('calendar')}</span>
         <time datetime="${announcement.date || ''}">${dateStr}</time>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="announcements-grid-layout">
        ${sidebarHtml}
        <div class="announcements-main">
          <article class="panel-card" style="padding:0; overflow:hidden; border:none; box-shadow:var(--shadow-md);">
             <div style="width:100%; max-height:500px; overflow:hidden; background:var(--color-primary-900); display:flex; align-items:center; justify-content:center;">
               <img src="${announcement.image || '/logo.png'}" alt="${escapeAttr(announcement.title)}" style="width:100%; height:100%; object-fit:cover; display:block;" />
             </div>
             <div style="padding: 2.5rem;" class="typography">
                ${sanitizeHtml(announcement.content)}
                
                ${renderLinkPreview(announcement.preview)}
                
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                   <div style="display:flex; align-items:center; gap:1rem;">
                      <span style="font-weight:700; color:var(--color-text-muted);">Paylaş:</span>
                      <a href="https://wa.me/?text=${encodeURIComponent(announcement.title + ' ' + content.site.url + '/duyurular/' + slugify(announcement.title))}" target="_blank" class="btn btn--sm" style="background:#25D366; color:white; border:none; text-decoration:none; padding: 0.5rem 1rem; border-radius: 6px;">WhatsApp</a>
                      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.site.url + '/duyurular/' + slugify(announcement.title))}" target="_blank" class="btn btn--sm" style="background:#1877F2; color:white; border:none; text-decoration:none; padding: 0.5rem 1rem; border-radius: 6px;">Facebook</a>
                   </div>
                   <a href="${toAbsoluteUrl(content.site.url, '/duyurular')}" class="btn btn--secondary" title="Tüm Duyurulara Dön">Tüm Duyurulara Dön</a>
                </div>
             </div>
          </article>
        </div>
      </div>
    </div>
  </section>
  `;
}

function renderPageContent(pageKey, content) {
  if (pageKey.startsWith('announcement:')) {
    return renderAnnouncementDetailPage(content, pageKey.split(':')[1]);
  }
  switch (pageKey) {
    case 'index': return renderIndexContent(content);
    case 'hakkimizda': return renderAboutContent(content);
    case 'galeri': return renderGalleryContent(content);
    case 'duyurular': return renderAnnouncementsContent(content);
    case 'tuzuk': return renderConstitutionContent(content);
    case 'iletisim': return renderContactContent(content);
    case 'notfound': return renderNotFoundContent(content);
    default: return '';
  }
}

function buildOrganizationSchema(content) {
  const org = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'NGO'],
    name: content.site.name,
    url: toAbsoluteUrl(content.site.url, '/'),
    description: content.site.description,
    foundingDate: content.site.foundedDate || '2026-02-05',
    foundingLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Kırşehir', addressCountry: 'TR' } },
    contactPoint: [],
  };

  if (content.site.status.hasLogo && content.site.logoPath) {
    org.logo = toAbsoluteUrl(content.site.url, content.site.logoPath);
  }
  if (content.contact.phone) {
    org.contactPoint.push({ '@type': 'ContactPoint', telephone: content.contact.phoneHref.replace('tel:', ''), contactType: 'customer support', availableLanguage: 'Turkish' });
  }
  if (content.contact.email) {
    org.contactPoint.push({ '@type': 'ContactPoint', email: content.contact.email, contactType: 'customer support' });
  }
  const socialLinks = Object.values(content.contact.social || {}).filter(Boolean);
  if (socialLinks.length > 0) org.sameAs = socialLinks;
  if (content.site.status.hasAddress && content.contact.address?.full) {
    org.address = { '@type': 'PostalAddress', streetAddress: content.contact.address.full, addressLocality: content.contact.address.city, postalCode: content.contact.address.postalCode, addressCountry: 'TR' };
  }

  const mapsUrl = content.contact.googleMapsUrl;
  if (mapsUrl) {
    if (!org.sameAs) org.sameAs = [];
    if (!org.sameAs.includes(mapsUrl)) org.sameAs.push(mapsUrl);
  }
  if (org.contactPoint?.length) {
    org.contactPoint.forEach(cp => { cp.areaServed = 'Kırşehir'; });
  }
  return org;
}

function buildLocalBusinessSchema(content) {
  if (!(content.site.status.hasAddress && content.site.status.hasGeoCoordinates && content.contact.geo?.lat && content.contact.geo?.lng)) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: content.site.name,
    telephone: content.contact.phone,
    email: content.contact.email,
    address: { '@type': 'PostalAddress', streetAddress: content.contact.address.full, addressLocality: content.contact.address.city, postalCode: content.contact.address.postalCode, addressCountry: 'TR' },
    geo: { '@type': 'GeoCoordinates', latitude: content.contact.geo.lat, longitude: content.contact.geo.lng },
    url: toAbsoluteUrl(content.site.url, '/'),
  };
}

function renderHead(pageKey, content) {
  const pageMeta = getPageMeta(pageKey, content);
  const pageUrl = pageMeta.canonical || toAbsoluteUrl(content.site.url, getPagePath(pageKey));
  const ogImageUrl = content.site.ogImagePath ? toAbsoluteUrl(content.site.url, content.site.ogImagePath) : null;
  const twitterCard = ogImageUrl ? 'summary_large_image' : 'summary';
  const appleTouchIcon = `<link rel="apple-touch-icon" href="${toAbsoluteUrl(content.site.url, content.site.appleTouchIconPath || '/logo.png')}" />`;

  let newsSchema = null;
  if (pageKey.startsWith('announcement:')) {
    const slug = pageKey.split(':')[1];
    const ann = content.announcements.find(a => slugify(a.title) === slug);
    if (ann) {
      newsSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: ann.title,
        image: ann.image ? [toAbsoluteUrl(content.site.url, ann.image)] : [],
        datePublished: ann.date || '2026-04-10T00:00:00Z',
        dateModified: ann.date || '2026-04-10T00:00:00Z',
        author: { '@type': 'Organization', name: content.site.name, url: toAbsoluteUrl(content.site.url, '/') },
        publisher: { '@type': 'Organization', name: content.site.name, logo: { '@type': 'ImageObject', url: toAbsoluteUrl(content.site.url, content.site.logoPath || '/favicon.svg') } }
      };
    }
  }

  const schemas = [
    renderJsonLd(buildOrganizationSchema(content)),
    buildLocalBusinessSchema(content) ? renderJsonLd(buildLocalBusinessSchema(content)) : '',
    pageMeta.breadcrumbs ? renderJsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: pageMeta.breadcrumbs.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.item })) }) : '',
    renderJsonLd({ '@context': 'https://schema.org', '@type': 'WebPage', name: pageMeta.webPageName, url: pageUrl, description: pageMeta.webPageDescription, inLanguage: 'tr-TR' }),
    newsSchema ? renderJsonLd(newsSchema) : ''
  ].filter(Boolean).join('\n');

  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#4F46E5" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0F1117" media="(prefers-color-scheme: dark)" />
  <style>:root{--color-bg:#fff;--color-primary-600:#4F46E5;--font-heading:'Outfit',system-ui,sans-serif;--header-height:72px}body{margin:0;opacity:0;font-family:'Inter',system-ui,sans-serif;background:var(--color-bg)}body.ready{opacity:1;transition:opacity .15s ease}#main-content{animation: fade-in-page 0.3s ease-out forwards;}@keyframes fade-in-page{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}#loader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1b4b,#1a0a3d)}</style>
  <title>${escapeHtml(pageMeta.title)}</title>
  <meta name="description" content="${escapeAttr(pageMeta.description)}" />
  <meta name="author" content="${escapeAttr(content.site.name)}" />
  <meta name="publisher" content="${escapeAttr(content.site.name)}" />
  ${pageMeta.robots ? `<meta name="robots" content="${escapeAttr(pageMeta.robots)}" />` : ''}
  ${pageMeta.canonical ? `<link rel="canonical" href="${escapeAttr(pageMeta.canonical)}" />` : ''}
  <link rel="alternate" hreflang="tr" href="${escapeAttr(pageUrl)}" />
  <link rel="alternate" hreflang="x-default" href="${escapeAttr(pageUrl)}" />
  <meta property="og:title" content="${escapeAttr(pageMeta.title)}" />
  <meta property="og:description" content="${escapeAttr(pageMeta.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeAttr(pageUrl)}" />
  <meta property="og:locale" content="${escapeAttr(content.site.locale)}" />
  <meta property="og:site_name" content="${escapeAttr(content.site.name)}" />
  ${ogImageUrl ? `<meta property="og:image" content="${escapeAttr(ogImageUrl)}" />` : ''}
  <meta name="twitter:card" content="${twitterCard}" />
  <meta name="twitter:title" content="${escapeAttr(pageMeta.title)}" />
  <meta name="twitter:description" content="${escapeAttr(pageMeta.description)}" />
  ${ogImageUrl ? `<meta name="twitter:image" content="${escapeAttr(ogImageUrl)}" />` : ''}
  <link rel="icon" type="image/svg+xml" href="${toAbsoluteUrl(content.site.url, '/favicon.svg')}" />
  <link rel="icon" type="image/png" href="${toAbsoluteUrl(content.site.url, '/logo.png')}" />
  ${appleTouchIcon}
  <link rel="manifest" href="${toAbsoluteUrl(content.site.url, '/site.webmanifest')}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${renderThemeBootstrap()}
  ${schemas}`;
}

function renderBody(pageKey, content) {
  const currentPath = getPagePath(pageKey);
  const includeGlobalChrome = pageKey !== 'notfound';

  const watermarkHtml = content.site.logoPath
    ? `<div class="watermark-logo-overlay" style="background-image: url('${escapeAttr(content.site.logoPath)}');"></div>`
    : '';

  return `${pageKey === 'index' ? renderLoader(content) : ''}
  ${renderSkipLink()}
  ${watermarkHtml}
  ${renderHeader(content, currentPath, { showCta: pageKey !== 'notfound' })}
  ${renderMobileNav(content, currentPath, { showCta: pageKey !== 'notfound' })}
  <main id="main-content" tabindex="-1">
    ${renderPageContent(pageKey, content)}
  </main>
  ${renderFooter(content, { minimal: pageKey === 'notfound' })}
  ${includeGlobalChrome ? renderBackToTop() : ''}
  ${includeGlobalChrome ? renderWhatsAppFloat(content) : ''}
  ${includeGlobalChrome ? renderToolbar() : ''}
  ${includeGlobalChrome && content.contact.phone ? `<div class="mobile-cta-bar" role="complementary" aria-label="Hızlı arama">
    <a href="${toAbsoluteUrl(content.site.url, content.contact.phoneHref || 'tel:' + content.contact.phone)}" class="mobile-cta-bar__link" title="Hızlı Arama">
      <div class="mobile-cta-bar__icon">${icon('phone')}</div>
      <div class="mobile-cta-bar__text">Bize Ulaşın: <strong>${escapeHtml(content.contact.phone)}</strong></div>
    </a>
  </div>` : ''}
  <style>
    @media (max-width: 1024px) {
      .whatsapp-float { bottom: 85px !important; right: 20px !important; width: 50px !important; height: 50px !important; }
      .mobile-cta-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--color-primary-600); z-index: 1000; padding: 12px; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); display: block !important; }
      .mobile-cta-bar__link { display: flex; align-items: center; justify-content: center; gap: 10px; color: white; text-decoration: none; font-size: 0.9rem; }
      .mobile-cta-bar__icon { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .mobile-cta-bar__icon svg { width: 16px; height: 16px; color: white; }
    }
    @media (min-width: 1025px) { .mobile-cta-bar { display: none !important; } }
  </style>`;
}

export function renderDocumentFragments(pageKey) {
  const content = readSiteContent();
  content.site.url = 'https://kirged.org';
  return {
    head: renderHead(pageKey, content),
    body: renderBody(pageKey, content),
  };
}
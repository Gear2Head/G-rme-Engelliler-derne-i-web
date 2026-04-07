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

function escapeAttr(value) { return escapeHtml(value); }

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
  if (/^https?:\/\//i.test(target)) return target;
  return new URL(ensureLeadingSlash(target), `${siteUrl.replace(/\/$/, '')}/`).toString();
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`;
}

function getPagePath(pageKey) {
  const paths = {
    index: '/',
    hakkimizda: '/hakkimizda',
    galeri: '/galeri',
    tuzuk: '/tuzuk',
    iletisim: '/iletisim',
    notfound: '/404.html',
  };
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

  const seoEntry = content.seo[pageKey];
  const pageNames = {
    hakkimizda: content.about.title,
    galeri: 'Galeri & Aktiviteler',
    tuzuk: content.constitution.title,
    iletisim: 'İletişim',
  };

  return {
    title: seoEntry.title,
    description: seoEntry.description,
    canonical: toAbsoluteUrl(content.site.url, seoEntry.canonical),
    robots: null,
    breadcrumbs: pageKey === 'index' ? null : [
      { name: 'Ana Sayfa', item: toAbsoluteUrl(content.site.url, '/') },
      { name: pageNames[pageKey] || pageKey, item: toAbsoluteUrl(content.site.url, getPagePath(pageKey)) },
    ],
    webPageName: seoEntry.title,
    webPageDescription: seoEntry.description,
  };
}

function icon(name) {
  const icons = {
    accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
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
    external: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:0.85em;height:0.85em;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    directions: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  };
  return icons[name] ?? '';
}

function renderThemeBootstrap() {
  return `<script>(function(){var theme=localStorage.getItem('kged-theme');var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',theme||system);var fontSize=parseInt(localStorage.getItem('kged-font-size'),10);if(!isNaN(fontSize)&&fontSize!==100)document.documentElement.style.fontSize=fontSize+'%';})();<\/script>`;
}

function renderNavLinks(items, currentPath, className) {
  return items.map((item) => {
    const href = ensureLeadingSlash(item.href);
    const isCurrent = stripTrailingSlash(href) === stripTrailingSlash(currentPath);
    const currentAttr = isCurrent ? ' aria-current="page"' : '';
    return `<a href="${escapeAttr(href)}" class="${className}"${currentAttr}>${escapeHtml(item.label)}</a>`;
  }).join('\n');
}

function renderHeader(content, currentPath, options = {}) {
  const showCta = options.showCta !== false;
  const logoMarkup = content.site.status.hasLogo && content.site.logoPath
    ? `<img src="${escapeAttr(content.site.logoPath)}" alt="${escapeAttr(content.site.logoAlt || `${content.site.name} logosu`)}" class="header__logo-image" style="width: 56px; height: auto; object-fit: contain;" aria-hidden="true" />`
    : `<div class="header__logo-icon" aria-hidden="true">${icon('eye')}</div>`;

  const ctaMarkup = showCta
    ? `<a href="${escapeAttr(content.hero.cta.primary.href)}" class="btn btn--primary btn--sm" id="header-cta">${icon('phone')}${escapeHtml(content.hero.cta.primary.label)}</a>`
    : '';

  return `<header class="header" role="banner">
    <div class="container header__inner">
      <a href="/" class="header__logo" aria-label="${escapeAttr(`${content.site.name} — Ana Sayfa`)}">
        ${logoMarkup}
        <div class="header__logo-text">
          <span class="header__logo-name">${escapeHtml(content.site.name)}</span>
          <span class="header__logo-tagline">${escapeHtml(content.site.slogan)}</span>
        </div>
      </a>
      <nav class="nav--desktop" aria-label="Ana menü">
        ${renderNavLinks(content.nav, currentPath, 'nav__link')}
      </nav>
      <div class="header__actions">
        ${ctaMarkup}
        <button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menüyü aç">
          ${icon('menuOpen')}
          ${icon('menuClose')}
        </button>
      </div>
    </div>
  </header>`;
}

function renderMobileNav(content, currentPath, options = {}) {
  const showCta = options.showCta !== false;
  const ctaMarkup = showCta
    ? `<div style="margin-top: 1rem;">
      <a href="${escapeAttr(content.hero.cta.primary.href)}" class="btn btn--primary" style="width:100%;justify-content:center;">
        ${icon('phone')} ${escapeHtml(content.hero.cta.primary.label)}
      </a>
    </div>` : '';
  return `<nav class="nav--mobile" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobil menü">
    ${renderNavLinks(content.nav, currentPath, 'nav__link')}
    ${ctaMarkup}
  </nav>`;
}

function renderWhatsAppFloat(content) {
  if (!content.contact.whatsappHref) return '';
  return `<a href="${escapeAttr(content.contact.whatsappHref)}" class="whatsapp-float" aria-label="WhatsApp'tan bize ulaşın" target="_blank" rel="noopener noreferrer">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
  </a>`;
}

function renderFooter(content, options = {}) {
  const isMinimal = options.minimal === true;
  const navMarkup = renderNavLinks(content.nav, '', 'footer__link');
  const addressMarkup = content.site.status.hasAddress && content.contact.address?.short
    ? `<p class="footer__contact-row">${icon('map')}<a href="${escapeAttr(content.contact.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(content.contact.address.short)}</a></p>`
    : '';

  const socialLinks = Object.values(content.contact.social || {}).filter(Boolean);
  const sameAsMarkup = socialLinks.length > 0
    ? socialLinks.map((href) => `<a href="${escapeAttr(href)}" class="footer__link" target="_blank" rel="noopener noreferrer">${escapeHtml(new URL(href).hostname.replace('www.', ''))}</a>`).join('')
    : '';

  if (isMinimal) {
    return `<footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer__bottom" style="border-top:none; padding-top: 0;">
          <p class="footer__copy">© <span id="footer-year"></span> ${escapeHtml(content.site.name)}.</p>
          <nav aria-label="404 hızlı navigasyon"><div style="display:flex; gap: 1rem; flex-wrap: wrap;">${navMarkup}</div></nav>
        </div>
      </div>
    </footer>`;
  }

  return `<footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <p class="footer__brand-name">${escapeHtml(content.site.name)}</p>
          <p class="footer__brand-desc">${escapeHtml(content.footer.description)}</p>
          ${sameAsMarkup ? `<div style="display:flex; gap: 0.75rem; flex-wrap: wrap; margin-top: var(--space-4);">${sameAsMarkup}</div>` : ''}
        </div>
        <nav aria-label="Alt menü hızlı bağlantılar">
          <p class="footer__heading">Sayfalar</p>
          <ul class="footer__links">
            ${content.nav.map((item) => `<li><a href="${escapeAttr(ensureLeadingSlash(item.href))}" class="footer__link">${escapeHtml(item.label)}</a></li>`).join('')}
            <li><a href="/admin/" rel="nofollow" class="footer__link" style="opacity: 0.6;">Yönetici Girişi</a></li>
          </ul>
        </nav>
        <div>
          <p class="footer__heading">İletişim</p>
          <address class="footer__contact-info" style="font-style: normal;">
            <p class="footer__contact-row">${icon('phone')}<a href="${escapeAttr(content.contact.phoneHref)}">${escapeHtml(content.contact.phone)}</a></p>
            <p class="footer__contact-row">${icon('mail')}<a href="${escapeAttr(content.contact.emailHref)}" style="font-size:0.8rem; word-break:break-all;">${escapeHtml(content.contact.email)}</a></p>
            ${addressMarkup}
          </address>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">© <span id="footer-year"></span> ${escapeHtml(content.site.name)}. Tüm hakları saklıdır.</p>
        <a href="#main-content" id="back-to-top-footer" class="btn btn--ghost btn--sm" style="font-size: 0.8rem;">${icon('chevronUp')}Başa Dön</a>
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
      <button id="toolbar-dark" class="toolbar-btn" data-theme-toggle="dark" aria-pressed="false" aria-label="Karanlık mod aç/kapat">${icon('moon')}Karanlık Mod</button>
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

function renderSkipLink() { return '<a class="skip-link" href="#main-content">İçeriğe atla</a>'; }

function renderSectionHeader(title, lead, id) {
  return `<div class="section__header">
    <div class="section-accent" aria-hidden="true"></div>
    <h2 class="section__title"${id ? ` id="${escapeAttr(id)}"` : ''}>${escapeHtml(title)}</h2>
    ${lead ? `<p class="section__lead">${escapeHtml(lead)}</p>` : ''}
  </div>`;
}

// ──────────────────────────────────────────────────────────
// PAGE RENDERERS
// ──────────────────────────────────────────────────────────

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
        <a href="${escapeAttr(content.contact.phoneHref)}" class="feature-card" role="listitem" aria-label="Telefon et: ${escapeAttr(content.contact.phone)}">
          <div class="feature-card__icon" aria-hidden="true">${icon('phone')}</div>
          <h3 class="feature-card__title">Telefon Görüşmesi</h3>
          <p class="feature-card__text">Mesai saatleri içerisinde bizimle doğrudan telefon aracılığıyla iletişime geçebilirsiniz.</p>
          <div class="feature-card__link">Hemen Ara ${arrowRightIcon}</div>
        </a>
        ${content.contact.googleMapsUrl ? `
        <a href="${escapeAttr(content.contact.googleMapsUrl)}" class="feature-card" role="listitem" aria-label="Haritada göster, yeni sekmede açılır" target="_blank" rel="noopener noreferrer">
          <div class="feature-card__icon" aria-hidden="true">${icon('map')}</div>
          <h3 class="feature-card__title">Yerinde Ziyaret</h3>
          <p class="feature-card__text">Kırşehir merkezdeki dernek ofisimize uğrayarak çalışmalarımızla ilgili birebir bilgi alabilirsiniz.</p>
          <div class="feature-card__link">Konumu Bul ${arrowRightIcon}</div>
        </a>` : ''}
        <a href="${escapeAttr(content.hero.cta.primary.href)}" class="feature-card" role="listitem" aria-label="İletişim sayfasına git">
          <div class="feature-card__icon" aria-hidden="true">${icon('chat')}</div>
          <h3 class="feature-card__title">İletişim Formu</h3>
          <p class="feature-card__text">Kapsamlı sorularınız, bağış konuları veya kurumsal iş birlikleri için iletişim sayfamızı kullanabilirsiniz.</p>
          <div class="feature-card__link">Sayfaya Git ${arrowRightIcon}</div>
        </a>
        <a href="${escapeAttr(content.contact.emailHref)}" class="feature-card" role="listitem" aria-label="E-posta gönder">
          <div class="feature-card__icon" aria-hidden="true">${icon('mail')}</div>
          <h3 class="feature-card__title">E-posta Gönderimi</h3>
          <p class="feature-card__text">Resmi yazışmalar veya belge aktarımı için kurumsal e-posta adresimiz üzerinden bize ulaşabilirsiniz.</p>
          <div class="feature-card__link">Mail At ${arrowRightIcon}</div>
        </a>
      </div>
    </div>`;

  return `<section class="hero" aria-labelledby="hero-heading">
    <div class="container hero__inner">
      <div class="hero__content">
        <div class="hero__badge" aria-hidden="true">${icon('map')}${escapeHtml(locationLabel)}</div>
        <h1 class="hero__title" id="live-hero-title">${escapeHtml(content.hero.title)}</h1>
        <p class="hero__subtitle" id="live-hero-subtitle">${escapeHtml(content.hero.subtitle)}</p>
        <p class="hero__lead" id="live-hero-lead">${escapeHtml(content.hero.lead)}</p>
        <div class="hero__actions">
          <a href="${escapeAttr(content.hero.cta.primary.href)}" class="btn btn--accent btn--lg" id="hero-cta-primary">${icon('phone')}<span id="live-hero-cta-label">${escapeHtml(content.hero.cta.primary.label)}</span></a>
          <a href="${escapeAttr(content.hero.cta.secondary.href)}" class="btn btn--secondary btn--lg" id="hero-cta-secondary" style="border-color: rgba(165,180,252,0.4); color: #C7D2FE; background: rgba(99,102,241,0.1);">${icon('info')}${escapeHtml(content.hero.cta.secondary.label)}</a>
        </div>
      </div>
      <div class="hero__illustration" aria-hidden="true">
        <div class="hero__icon-wrap">
          <div class="hero__icon-bg"></div>
          <div class="hero__icon-ring"></div>
          <div class="hero__icon-center">${icon('eye')}</div>
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
            <p class="contact-item__value"><a href="${escapeAttr(content.contact.phoneHref)}">${escapeHtml(content.contact.phone)}</a></p>
          </div>
        </article>
        <article class="contact-item" aria-label="E-posta iletişim bilgisi">
          <div class="contact-item__icon" aria-hidden="true">${icon('mail')}</div>
          <div>
            <p class="contact-item__label">E-posta</p>
            <p class="contact-item__value" style="font-size:0.8rem;"><a href="${escapeAttr(content.contact.emailHref)}">${escapeHtml(content.contact.email)}</a></p>
          </div>
        </article>
      </div>
    </div>
  </section>`;
}

function renderAboutContent(content) {
  const goals = content.about.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('');

  // Founding date badge
  const foundingBadge = content.about.foundingDate
    ? `<div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; background:var(--color-primary-50); border:1px solid var(--color-primary-200); border-radius:var(--radius-full); font-size:var(--text-sm); font-weight:var(--weight-semibold); color:var(--color-primary-700); margin-bottom:var(--space-6); width: fit-content; max-width: 100%;">
        <span style="display:flex; width:20px; height:20px; flex-shrink:0;">${icon('calendar')}</span>
        <span style="white-space: nowrap;">Kuruluş: <time datetime="${escapeAttr(content.site.foundedDate || '2026-02-05')}">${escapeHtml(content.about.foundingDate)}</time></span>
      </div>`
    : '';

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="/" class="breadcrumb__link">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
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
        ${foundingBadge}
        <h2 id="live-about-intro-heading" style="font-size: var(--text-3xl); margin-bottom: var(--space-6);">${escapeHtml(content.about.introHeading || 'Biz Kimiz?')}</h2>
        <p id="live-about-intro" style="font-size: var(--text-lg); line-height: var(--leading-loose); color: var(--color-text-muted); margin-bottom: var(--space-6);">${escapeHtml(content.about.intro)}</p>
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
      <div style="max-width: 800px; margin-inline: auto;">
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
        <a href="/iletisim" class="btn btn--primary btn--lg" id="about-cta">${icon('phone')}${escapeHtml(content.about.ctaPrimaryLabel || 'İletişim Sayfası')}</a>
        <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--secondary btn--lg" id="about-phone">${escapeHtml(content.about.ctaSecondaryLabel || `Hemen Ara: ${content.contact.phone}`)}</a>
      </div>
    </div>
  </section>`;
}

function renderGalleryContent(content) {
  const galleryConfig = content.gallery || {};
  const catLabels = { etkinlik: 'Etkinlik', toplanti: 'Toplantı', egitim: 'Eğitim', ziyaret: 'Ziyaret', diger: 'Diğer' };
  const catColors = { etkinlik: 'var(--color-primary-600)', toplanti: '#16A34A', egitim: '#D97706', ziyaret: '#0891B2', diger: '#6B7280' };

  // Gallery items come from admin panel (localStorage) at runtime
  // We render a shell with filter buttons and empty state; JS fills items
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
      .gallery-lightbox img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: var(--radius-lg); }
      .gallery-lightbox-close { position: absolute; top: var(--space-6); right: var(--space-6); background: rgba(255,255,255,0.1); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; transition: background var(--transition-fast); }
      .gallery-lightbox-close:hover { background: rgba(255,255,255,0.2); }
      .gallery-lightbox-caption { position: absolute; bottom: var(--space-6); left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: var(--space-3) var(--space-6); border-radius: var(--radius-lg); font-size: var(--text-sm); text-align: center; white-space: nowrap; }
    </style>`;

  return `${galleryStyles}
  <section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="/" class="breadcrumb__link">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
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
      <div class="gallery-page-grid" id="gallery-page-grid" aria-live="polite"></div>
    </div>
  </section>

  <div id="gallery-lightbox" class="gallery-lightbox" tabindex="-1" role="dialog" aria-modal="true" aria-label="Görsel büyütücü">
    <button class="gallery-lightbox-close" onclick="window.closeLightbox()" aria-label="Kapat">×</button>
    <img id="lightbox-img" src="" alt="" />
    <p id="lightbox-caption" class="gallery-lightbox-caption"></p>
  </div>

  <script type="module">
    import { getGalleryItems } from '/src/supabase/gallery.js';

    let galleryItems = [];
    let currentFilter = 'all';

    const catColors = { etkinlik:'#4F46E5', toplanti:'#16A34A', egitim:'#D97706', ziyaret:'#0891B2', diger:'#6B7280' };
    const catLabels = { etkinlik:'Etkinlik', toplanti:'Toplantı', egitim:'Eğitim', ziyaret:'Ziyaret', diger:'Diğer' };

    function renderGalleryPage() {
      const grid = document.getElementById('gallery-page-grid');
      const items = currentFilter === 'all' ? galleryItems : galleryItems.filter(i => (i.category || 'etkinlik') === currentFilter);

      if (items.length === 0) {
        grid.innerHTML = \`<div class="gallery-empty" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p style="font-size:var(--text-lg); font-weight:600; margin-bottom:8px;">Henüz görsel eklenmemiş</p>
          <p style="font-size:var(--text-sm);">\${currentFilter !== 'all' ? 'Bu kategoride görsel bulunmuyor.' : 'Aktivitelerimizden kareler yakında burada yer alacaktır.'}</p>
        </div>\`;
        return;
      }

      grid.innerHTML = items.map((item, idx) => {
        const cat = item.category || 'etkinlik';
        const src = item.url || item.imageData || '';
        const cap = item.caption || '';
        const label = catLabels[cat] || 'Diğer';
        const color = catColors[cat] || '#6B7280';
        
        let imgHtml = '';
        if (src) {
          imgHtml = '<img class="gallery-card__img" src="' + src + '" alt="' + cap + '" loading="lazy" onclick="window.openLightbox(\\'' + src + '\\', \\'' + cap + '\\')" style="cursor:pointer;" />';
        } else {
          imgHtml = '<div class="gallery-card__img-placeholder">' + (cap || 'Görsel') + '</div>';
        }

        let dateHtml = '';
        if (item.created_at || item.createdAt) {
          const d = item.created_at || item.createdAt;
          dateHtml = '<p class="gallery-card__date"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' + new Date(d).toLocaleDateString("tr-TR", {day:"numeric",month:"long",year:"numeric"}) + '</p>';
        }

        return '<article class="gallery-card" data-category="' + cat + '">' +
          imgHtml +
          '<div class="gallery-card__body">' +
            '<span class="gallery-card__cat" style="background:' + color + ';">' + label + '</span>' +
            (cap ? '<p class="gallery-card__title">' + cap + '</p>' : '') +
            dateHtml +
          '</div>' +
        '</article>';
      }).join('');
    }

    window.filterGallery = function(btn, cat) {
      document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = cat;
      renderGalleryPage();
    };

    window.openLightbox = function(src, caption) {
      const lb = document.getElementById('gallery-lightbox');
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox-img').alt = caption || 'Görsel';
      document.getElementById('lightbox-caption').textContent = caption || '';
      lb.classList.add('open');
      lb.focus();
    };

    window.closeLightbox = function() {
      document.getElementById('gallery-lightbox').classList.remove('open');
    };

    document.getElementById('gallery-lightbox').addEventListener('click', function(e) {
      if (e.target === this) window.closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') window.closeLightbox();
    });

    async function initGallery() {
      const grid = document.getElementById('gallery-page-grid');
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);font-weight:500;">Görseller Yükleniyor...</div>';
      try {
        const items = await getGalleryItems();
        if (items) galleryItems = items;
      } catch (err) {
        console.error("Galeri yükleme hatası:", err);
      }
      renderGalleryPage();
    }

    initGallery();
  </script>
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
    ? `<div style="border:1px solid var(--color-border); border-radius:var(--radius-xl); overflow:hidden; margin-bottom:var(--space-8); background:var(--color-surface); box-shadow:var(--shadow-sm);">
        <div style="background:var(--color-primary-950); padding:var(--space-3) var(--space-5); display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); color:var(--color-primary-100);">
          <svg style="width:18px;height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span style="font-weight:600;">Tüzük Belgesi Görüntüleyici</span>
        </div>
        <object data="${escapeAttr(content.constitution.pdfPath)}" type="application/pdf" width="100%" height="600" style="display:block;">
          <div style="padding:var(--space-8); text-align:center; color:var(--color-text-muted);">
            <p style="margin-bottom:var(--space-4);">PDF görüntüleyiciniz bu dosyayı gösteremiyor.</p>
            <a href="${escapeAttr(content.constitution.pdfPath)}" class="btn btn--primary" download>İndir</a>
          </div>
        </object>
      </div>`
    : '';

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="/" class="breadcrumb__link">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
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
        <a href="/iletisim" class="btn btn--primary btn--lg" id="constitution-cta">${escapeHtml(content.constitution.ctaPrimaryLabel || 'İletişime Geç')}</a>
        <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--secondary btn--lg" id="constitution-phone">${escapeHtml(content.constitution.ctaSecondaryLabel || content.contact.phone)}</a>
      </div>
    </div>
  </section>`;
}

function renderContactContent(content) {
  const hasAddress = Boolean(content.site.status.hasAddress && content.contact.address?.full);
  const hasMap = Boolean(content.site.status.hasMapsEmbed);
  const mapQuery = (content.contact.geo?.lat && content.contact.geo?.lng)
    ? `${content.contact.geo.lat},${content.contact.geo.lng}`
    : content.contact.address?.full;
  const mapEmbedSrc = (hasMap && mapQuery)
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;

  const addressCard = hasAddress
    ? `<article class="contact-item" aria-label="Adres bilgisi">
        <div class="contact-item__icon" aria-hidden="true">${icon('map')}</div>
        <div>
          <p class="contact-item__label">Adres</p>
          <address style="font-style:normal;">
            <p class="contact-item__value" style="font-size:0.85rem;">${escapeHtml(content.contact.address.full).replace(/,\s/g, ',<br>')}</p>
          </address>
        </div>
      </article>`
    : `<div class="status-banner" role="status" aria-live="polite"><p>${escapeHtml(content.contact.address?.status || 'Adres bilgisi doğrulanınca bu alanda yayınlanacaktır.')}</p></div>`;

  const mapMarkup = hasMap
    ? `<div style="overflow:hidden;border-radius:var(--radius-xl);border:1px solid var(--color-border);position:relative;" id="map-wrapper">
        <div id="map-cover" style="width:100%;min-height:360px;background:var(--color-surface);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;cursor:pointer;" onclick="document.getElementById('map-cover').style.display='none';document.getElementById('map-iframe').style.display='block';" role="button" aria-label="Haritayı yükle">
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' style='width:48px;height:48px;color:var(--color-text-faint);'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>
          <p style='color:var(--color-text-muted);font-size:var(--text-sm);'>Haritayı görmek için tıklayın</p>
          <button style='padding:0.5rem 1.25rem;background:var(--color-primary-600);color:#fff;border:none;border-radius:var(--radius-full);cursor:pointer;font-size:var(--text-sm);'>Haritayı Yükle</button>
        </div>
        <iframe id="map-iframe" src="${escapeAttr(mapEmbedSrc)}" title="${escapeAttr(`${content.site.name} Konumu`)}" referrerpolicy="no-referrer-when-downgrade" style="width:100%;min-height:360px;border:0;display:none;"></iframe>
      </div>`
    : `<div class="map-placeholder" role="img" aria-label="Harita henüz etkin değil">
        ${icon('map')}
        <p><strong>${escapeHtml(content.contact.mapPlaceholderTitle || 'Harita yakında burada olacak.')}</strong><br>${escapeHtml(content.contact.mapPlaceholderText || '')}</p>
      </div>`;

  const addressDetailSection = hasAddress
    ? `<section class="section section--alt" aria-labelledby="address-confirmed-heading">
        <div class="container">
          <div style="max-width:640px;margin-inline:auto;">
            <div class="section-accent" aria-hidden="true"></div>
            <h2 id="address-confirmed-heading" style="font-size:var(--text-2xl);margin-bottom:var(--space-6);">${escapeHtml(content.contact.addressSectionTitle || 'Adresimiz')}</h2>
            <div class="card" style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;">
              <div class="card__icon" aria-hidden="true" style="flex-shrink:0;">${icon('map')}</div>
              <div style="flex:1;">
                <address style="font-style:normal;">
                  <p style="font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--color-text);margin-bottom:var(--space-2);">${escapeHtml(content.contact.address.short || content.contact.address.full)}</p>
                  <p style="color:var(--color-text-muted);margin-bottom:var(--space-5);">${escapeHtml(content.contact.address.full)}</p>
                </address>
                ${content.contact.googleMapsUrl ? `<a href="${escapeAttr(content.contact.googleMapsUrl)}" class="btn btn--primary" target="_blank" rel="noopener noreferrer" id="directions-btn">${icon('directions')}${escapeHtml(content.contact.directionsLabel || 'Yol Tarifi Al')}</a>` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>` : '';

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item"><a href="/" class="breadcrumb__link">Ana Sayfa</a><span class="breadcrumb__separator" aria-hidden="true">›</span></li>
          <li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">İletişim</span></li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">İletişim</h1>
      <p class="page-header__lead">${escapeHtml(content.contact.pageLead || 'Sorularınız için aşağıdaki kanallardan bize kolayca ulaşabilirsiniz.')}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="contact-info-heading">
    <div class="container">
      <div class="section-accent" aria-hidden="true"></div>
      <h2 id="contact-info-heading" style="font-size:var(--text-3xl);margin-bottom:var(--space-8);">İletişim Bilgileri</h2>
      <div class="contact-grid">
        <div>
          <div style="display:flex;flex-direction:column;gap:var(--space-4);margin-bottom:var(--space-6);">
            <article class="contact-item" aria-label="Telefon iletişim bilgisi">
              <div class="contact-item__icon" aria-hidden="true">${icon('phone')}</div>
              <div><p class="contact-item__label">Telefon</p><p class="contact-item__value"><a href="${escapeAttr(content.contact.phoneHref)}">${escapeHtml(content.contact.phone)}</a></p></div>
            </article>
            <article class="contact-item" aria-label="E-posta iletişim bilgisi">
              <div class="contact-item__icon" aria-hidden="true">${icon('mail')}</div>
              <div><p class="contact-item__label">E-posta</p><p class="contact-item__value" style="font-size:0.85rem;"><a href="${escapeAttr(content.contact.emailHref)}">${escapeHtml(content.contact.email)}</a></p></div>
            </article>
            ${addressCard}
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--primary btn--lg" id="contact-call">${icon('phone')}Şimdi Ara: ${escapeHtml(content.contact.phone)}</a>
            <a href="${escapeAttr(content.contact.emailHref)}" class="btn btn--secondary btn--lg" id="contact-email">${icon('mail')}E-posta Gönder</a>
            ${content.contact.googleMapsUrl ? `<a href="${escapeAttr(content.contact.googleMapsUrl)}" class="btn btn--ghost btn--lg" id="contact-maps" target="_blank" rel="noopener noreferrer">${icon('map')}Haritada Ara${icon('external')}</a>` : ''}
          </div>
        </div>
        <div>${mapMarkup}</div>
      </div>
    </div>
  </section>
  ${addressDetailSection}`;
}

function renderNotFoundContent() {
  return `<div class="error-page" role="alert" aria-labelledby="error-title" aria-describedby="error-desc">
    <div style="max-width: 560px; margin-inline: auto;">
      <p class="error-page__code" aria-hidden="true">404</p>
      <h1 class="error-page__title" id="error-title">Sayfa Bulunamadı</h1>
      <p class="error-page__desc" id="error-desc">Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/" class="btn btn--primary btn--lg" id="error-home-btn">${icon('home')}Ana Sayfaya Dön</a>
        <a href="/iletisim" class="btn btn--secondary btn--lg" id="error-contact-btn">${icon('phone')}İletişime Geç</a>
      </div>
    </div>
  </div>`;
}

function renderPageContent(pageKey, content) {
  switch (pageKey) {
    case 'index': return renderIndexContent(content);
    case 'hakkimizda': return renderAboutContent(content);
    case 'galeri': return renderGalleryContent(content);
    case 'tuzuk': return renderConstitutionContent(content);
    case 'iletisim': return renderContactContent(content);
    case 'notfound': return renderNotFoundContent(content);
    default: return '';
  }
}

// ──────────────────────────────────────────────────────────
// SCHEMA
// ──────────────────────────────────────────────────────────

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
  // TODO 45: Add areaServed and Google Maps sameAs
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

// ──────────────────────────────────────────────────────────
// HEAD / BODY
// ──────────────────────────────────────────────────────────

function renderHead(pageKey, content) {
  const pageMeta = getPageMeta(pageKey, content);
  const pageUrl = pageMeta.canonical || toAbsoluteUrl(content.site.url, getPagePath(pageKey));
  const ogImageUrl = content.site.ogImagePath ? toAbsoluteUrl(content.site.url, content.site.ogImagePath) : null;
  const twitterCard = ogImageUrl ? 'summary_large_image' : 'summary';
  const appleTouchIcon = content.site.appleTouchIconPath ? `<link rel="apple-touch-icon" href="${escapeAttr(content.site.appleTouchIconPath)}" />` : '';

  const schemas = [
    renderJsonLd(buildOrganizationSchema(content)),
    buildLocalBusinessSchema(content) ? renderJsonLd(buildLocalBusinessSchema(content)) : '',
    pageMeta.breadcrumbs ? renderJsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: pageMeta.breadcrumbs.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.item })) }) : '',
    renderJsonLd({ '@context': 'https://schema.org', '@type': 'WebPage', name: pageMeta.webPageName, url: pageUrl, description: pageMeta.webPageDescription, inLanguage: 'tr-TR' }),
  ].filter(Boolean).join('\n');

  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#4F46E5" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#0F1117" media="(prefers-color-scheme: dark)" />
  <style>:root{--color-bg:#fff;--color-primary-600:#4F46E5;--font-heading:'Outfit',system-ui,sans-serif;--header-height:72px}body{margin:0;opacity:0;font-family:'Inter',system-ui,sans-serif;background:var(--color-bg)}body.ready{opacity:1;transition:opacity .15s ease}#loader{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e1b4b,#1a0a3d)}</style>
  <title>${escapeHtml(pageMeta.title)}</title>
  <meta name="description" content="${escapeAttr(pageMeta.description)}" />
  ${pageMeta.robots ? `<meta name="robots" content="${escapeAttr(pageMeta.robots)}" />` : ''}
  ${pageMeta.canonical ? `<link rel="canonical" href="${escapeAttr(pageMeta.canonical)}" />` : ''}
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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  ${appleTouchIcon}
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${renderThemeBootstrap()}
  ${schemas}`;
}

function renderBody(pageKey, content) {
  const currentPath = getPagePath(pageKey);
  const includeGlobalChrome = pageKey !== 'notfound';

  return `${pageKey === 'index' ? renderLoader(content) : ''}
  ${renderSkipLink()}
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
    <a href="${escapeAttr(content.contact.phoneHref || 'tel:' + content.contact.phone)}" aria-label="Hemen ara: ${escapeAttr(content.contact.phone)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Bizi Ara — ${escapeHtml(content.contact.phone)}
    </a>
  </div>` : ''}`;
}

export function renderDocumentFragments(pageKey) {
  const content = readSiteContent();
  return {
    head: renderHead(pageKey, content),
    body: renderBody(pageKey, content),
  };
}
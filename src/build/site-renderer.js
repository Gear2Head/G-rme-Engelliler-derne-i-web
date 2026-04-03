import fs from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.resolve(process.cwd(), 'src/data/site-content.json');
const TURKEY_LABEL = 'Türkiye';

function readSiteContent() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
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
  if (/^https?:\/\//i.test(target)) return target;
  return new URL(ensureLeadingSlash(target), `${siteUrl.replace(/\/$/, '')}/`).toString();
}

function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function getPagePath(pageKey) {
  switch (pageKey) {
    case 'index':
      return '/';
    case 'hakkimizda':
      return '/hakkimizda';
    case 'tuzuk':
      return '/tuzuk';
    case 'iletisim':
      return '/iletisim';
    case 'notfound':
      return '/404.html';
    default:
      return '/';
  }
}

function getPageMeta(pageKey, content) {
  if (pageKey === 'notfound') {
    return {
      title: `Sayfa Bulunamadı | ${content.site.name}`,
      description: 'Aradığınız sayfa bulunamadı. Ana sayfaya dönerek devam edebilirsiniz.',
      canonical: null,
      robots: 'noindex, nofollow',
      breadcrumbs: null,
      webPageName: `Sayfa Bulunamadı | ${content.site.name}`,
      webPageDescription: '404 hata sayfası.',
    };
  }

  const seoEntry = content.seo[pageKey];
  const pageName = pageKey === 'hakkimizda'
    ? content.about.title
    : pageKey === 'tuzuk'
      ? content.constitution.title
      : 'İletişim';

  return {
    title: seoEntry.title,
    description: seoEntry.description,
    canonical: toAbsoluteUrl(content.site.url, seoEntry.canonical),
    robots: null,
    breadcrumbs: pageKey === 'index'
      ? null
      : [
          { name: 'Ana Sayfa', item: toAbsoluteUrl(content.site.url, '/') },
          { name: pageName, item: toAbsoluteUrl(content.site.url, getPagePath(pageKey)) },
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
  return `<script>(function(){var theme=localStorage.getItem('kged-theme');var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',theme||system);var fontSize=parseInt(localStorage.getItem('kged-font-size'),10);if(!isNaN(fontSize)&&fontSize!==100)document.documentElement.style.fontSize=fontSize+'%';})();</script>`;
}

function renderNavLinks(items, currentPath, className) {
  return items
    .map((item) => {
      const href = ensureLeadingSlash(item.href);
      const isCurrent = stripTrailingSlash(href) === stripTrailingSlash(currentPath);
      const currentAttr = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${escapeAttr(href)}" class="${className}"${currentAttr}>${escapeHtml(item.label)}</a>`;
    })
    .join('\n');
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
        ${icon('phone')}
        ${escapeHtml(content.hero.cta.primary.label)}
      </a>
    </div>`
    : '';

  return `<nav class="nav--mobile" id="mobile-nav" aria-label="Mobil menü">
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
    ? `<p class="footer__contact-row">
          ${icon('map')}
          <a href="${escapeAttr(content.contact.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(content.contact.address.short)}</a>
        </p>`
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
          <nav aria-label="404 hızlı navigasyon">
            <div style="display:flex; gap: 1rem; flex-wrap: wrap;">
              ${navMarkup}
            </div>
          </nav>
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
          </ul>
        </nav>
        <div>
          <p class="footer__heading">İletişim</p>
          <address class="footer__contact-info" style="font-style: normal;">
            <p class="footer__contact-row">
              ${icon('phone')}
              <a href="${escapeAttr(content.contact.phoneHref)}">${escapeHtml(content.contact.phone)}</a>
            </p>
            <p class="footer__contact-row">
              ${icon('mail')}
              <a href="${escapeAttr(content.contact.emailHref)}" style="font-size:0.8rem; word-break:break-all;">${escapeHtml(content.contact.email)}</a>
            </p>
            ${addressMarkup}
          </address>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">© <span id="footer-year"></span> ${escapeHtml(content.site.name)}. Tüm hakları saklıdır.</p>
        <a href="#main-content" id="back-to-top-footer" class="btn btn--ghost btn--sm" style="font-size: 0.8rem;">
          ${icon('chevronUp')}
          Başa Dön
        </a>
      </div>
    </div>
  </footer>`;
}

function renderToolbar() {
  return `<div class="toolbar" role="complementary" aria-label="Erişilebilirlik araç çubuğu">
    <button
      id="toolbar-toggle"
      class="toolbar__toggle"
      aria-expanded="false"
      aria-controls="toolbar-panel"
      aria-label="Erişilebilirlik araç çubuğunu aç"
      title="Erişilebilirlik Araçları"
    >
      ${icon('accessibility')}
    </button>
    <div id="toolbar-panel" class="toolbar__panel" role="group" aria-label="Erişilebilirlik seçenekleri">
      <p class="toolbar__header">Erişilebilirlik</p>
      <div class="font-size-display">
        <span class="toolbar-btn" style="flex:1; pointer-events:none;">
          ${icon('text')}
          Yazı Boyutu
        </span>
        <span id="toolbar-font-value" class="font-size-value">100%</span>
        <div class="font-size-controls">
          <button id="toolbar-font-decrease" aria-label="Yazı boyutunu küçült" title="Küçült">A−</button>
          <button id="toolbar-font-increase" aria-label="Yazı boyutunu büyüt" title="Büyüt">A+</button>
        </div>
      </div>
      <button id="toolbar-dark" class="toolbar-btn" data-theme-toggle="dark" aria-pressed="false" aria-label="Karanlık mod aç/kapat">
        ${icon('moon')}
        Karanlık Mod
      </button>
      <button id="toolbar-hc" class="toolbar-btn" data-theme-toggle="high-contrast" aria-pressed="false" aria-label="Yüksek kontrast modu aç/kapat">
        ${icon('contrast')}
        Yüksek Kontrast
      </button>
      <button id="toolbar-grayscale" class="toolbar-btn" aria-pressed="false" aria-label="Gri ton modunu aç/kapat">
        ${icon('grayscale')}
        Gri Ton
      </button>
      <button id="toolbar-dyslexia" class="toolbar-btn" aria-pressed="false" aria-label="Disleksi dostu fontu aç/kapat">
        ${icon('dyslexia')}
        Disleksi Fontu
      </button>
      <div class="toolbar__reset">
        <button id="toolbar-reset" class="toolbar-btn" aria-label="Tüm erişilebilirlik ayarlarını sıfırla">
          ${icon('reset')}
          Sıfırla
        </button>
      </div>
    </div>
  </div>`;
}

function renderBackToTop() {
  return `<button id="back-to-top" aria-label="Sayfanın başına dön" title="Başa Dön">
    ${icon('chevronUp')}
  </button>`;
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
    <div class="loader__progress" aria-hidden="true">
      <div class="loader__progress-bar"></div>
    </div>
  </div>`;
}

function renderSkipLink() {
  return '<a class="skip-link" href="#main-content">İçeriğe atla</a>';
}

function renderSectionHeader(title, lead) {
  return `<div class="section__header">
    <div class="section-accent" aria-hidden="true"></div>
    <h2 class="section__title">${escapeHtml(title)}</h2>
    ${lead ? `<p class="section__lead">${escapeHtml(lead)}</p>` : ''}
  </div>`;
}

function renderIndexContent(content) {
  const locationLabel = content.hero.locationLabel || [content.contact.address?.city, TURKEY_LABEL].filter(Boolean).join(', ');
  const missionCards = content.mission.cards
    .map((card, index) => `<article class="card" aria-labelledby="mission-${index + 1}-title">
      <div class="card__icon" aria-hidden="true">${icon(card.icon)}</div>
      <h3 class="card__title" id="mission-${index + 1}-title">${escapeHtml(card.title)}</h3>
      <p class="card__text">${escapeHtml(card.text)}</p>
    </article>`)
    .join('');

  const arrowRightIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><line x1="6" y1="12" x2="18" y2="12"/></svg>`;

  const staggeredGridHtml = `
    <div class="staggered-layout">
      <div class="staggered-layout__bg" aria-hidden="true"></div>
      <div class="staggered-grid" role="list">
        
        <a href="${escapeAttr(content.contact.phoneHref)}" class="feature-card" role="listitem" aria-label="Telefon et: ${escapeAttr(content.contact.phone)}">
          <div class="feature-card__icon" aria-hidden="true">${icon('phone')}</div>
          <h3 class="feature-card__title">Telefon Görüşmesi</h3>
          <p class="feature-card__text">Mesai saatleri içerisinde bizimle doğrudan telefon aracılığıyla iletişime geçebilirsiniz. Destek hattımız sorularınız veya talepleriniz için hazırdır.</p>
          <div class="feature-card__link">Hemen Ara ${arrowRightIcon}</div>
        </a>

        ${content.contact.googleMapsUrl ? `
        <a href="${escapeAttr(content.contact.googleMapsUrl)}" class="feature-card" role="listitem" aria-label="Haritada göster, yeni sekmede açılır" target="_blank" rel="noopener noreferrer">
          <div class="feature-card__icon" aria-hidden="true">${icon('map')}</div>
          <h3 class="feature-card__title">Yerinde Ziyaret</h3>
          <p class="feature-card__text">Kırşehir merkezdeki dernek ofisimize uğrayarak çalışmalarımızla ilgili birebir bilgi alabilir, faaliyetlerimize yakından şahit olabilirsiniz.</p>
          <div class="feature-card__link">Konumu Bul ${arrowRightIcon}</div>
        </a>` : ''}

        <a href="${escapeAttr(content.hero.cta.primary.href)}" class="feature-card" role="listitem" aria-label="İletişim sayfasına git">
          <div class="feature-card__icon" aria-hidden="true">${icon('chat')}</div>
          <h3 class="feature-card__title">İletişim Formu</h3>
          <p class="feature-card__text">Kapsamlı sorularınız, bağış konuları veya kurumsal iş birlikleri için web sitemizdeki mesaj gönderme panelini kullanabilirsiniz.</p>
          <div class="feature-card__link">Sayfaya Git ${arrowRightIcon}</div>
        </a>

        <a href="${escapeAttr(content.contact.emailHref)}" class="feature-card" role="listitem" aria-label="E-posta gönder">
          <div class="feature-card__icon" aria-hidden="true">${icon('mail')}</div>
          <h3 class="feature-card__title">E-posta Gönderimi</h3>
          <p class="feature-card__text">Resmi yazışmalar veya belge aktarımı için kurumsal e-posta adresimiz üzerinden bize doğrudan mail yoluyla ulaşım sağlayabilirsiniz.</p>
          <div class="feature-card__link">Mail At ${arrowRightIcon}</div>
        </a>

      </div>
    </div>
  `;

  return `<section class="hero" aria-labelledby="hero-heading">
    <div class="container hero__inner">
      <div class="hero__content">
        <div class="hero__badge" aria-hidden="true">
          ${icon('map')}
          ${escapeHtml(locationLabel)}
        </div>
        <h1 class="hero__title" id="hero-heading">${escapeHtml(content.hero.title)}</h1>
        <p class="hero__subtitle">${escapeHtml(content.hero.subtitle)}</p>
        <p class="hero__lead">${escapeHtml(content.hero.lead)}</p>
        <div class="hero__actions">
          <a href="${escapeAttr(content.hero.cta.primary.href)}" class="btn btn--accent btn--lg" id="hero-cta-primary">
            ${icon('phone')}
            ${escapeHtml(content.hero.cta.primary.label)}
          </a>
          <a href="${escapeAttr(content.hero.cta.secondary.href)}" class="btn btn--secondary btn--lg" id="hero-cta-secondary" style="border-color: rgba(165,180,252,0.4); color: #C7D2FE; background: rgba(99,102,241,0.1);">
            ${icon('info')}
            ${escapeHtml(content.hero.cta.secondary.label)}
          </a>
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

  return `<section class="page-header" aria-labelledby="page-title">
    <div class="container page-header__inner">
      <nav class="breadcrumb" aria-label="Sayfa konumu">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <a href="/" class="breadcrumb__link">Ana Sayfa</a>
            <span class="breadcrumb__separator" aria-hidden="true">›</span>
          </li>
          <li class="breadcrumb__item">
            <span class="breadcrumb__current" aria-current="page">${escapeHtml(content.about.title)}</span>
          </li>
        </ol>
      </nav>
      <h1 class="page-header__title" id="page-title">${escapeHtml(content.about.title)}</h1>
      <p class="page-header__lead">${escapeHtml(content.about.pageLead || 'Görme engelli bireylerin yanında, her zaman.')}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="intro-heading">
    <div class="container">
      <div style="max-width: 800px; margin-inline: auto;">
        <div class="section-accent" aria-hidden="true"></div>
        <h2 id="intro-heading" style="font-size: var(--text-3xl); margin-bottom: var(--space-6);">${escapeHtml(content.about.introHeading || 'Biz Kimiz?')}</h2>
        <p style="font-size: var(--text-lg); line-height: var(--leading-loose); color: var(--color-text-muted); margin-bottom: var(--space-6);">${escapeHtml(content.about.intro)}</p>
        <p style="font-size: var(--text-base); line-height: var(--leading-loose); color: var(--color-text-muted); margin-bottom: var(--space-6);">${escapeHtml(content.about.description)}</p>
        <div class="alert alert--info" role="note" aria-label="Tarihçe hakkında bilgi">
          ${icon('info')}
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
        <div class="status-banner" role="status" aria-live="polite">
          <p>${escapeHtml(content.about.boardStatus)}</p>
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
        <a href="/iletisim" class="btn btn--primary btn--lg" id="about-cta">
          ${icon('phone')}
          ${escapeHtml(content.about.ctaPrimaryLabel || 'İletişim Sayfası')}
        </a>
        <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--secondary btn--lg" id="about-phone">
          ${escapeHtml(content.about.ctaSecondaryLabel || `Hemen Ara: ${content.contact.phone}`)}
        </a>
      </div>
    </div>
  </section>`;
}

function renderConstitutionContent(content) {
  const infoParagraphs = content.constitution.infoParagraphs || [
    'Dernek tüzüğü; derneğin kuruluş amacını, faaliyet alanlarını, üyelik koşullarını, yönetim yapısını ve mali esaslarını belirleyen temel belgedir. 5253 sayılı Dernekler Kanunu kapsamında hazırlanır.',
    'Tüzüğümüz yayınlandığında şu konuları kapsayacaktır: Derneğin adı ve merkezi, amaç ve faaliyet alanı, üyelik şartları, yönetim ve denetim kurulu yapısı, genel kurul esasları, mali hükümler ve fesih prosedürü.',
  ];

  const downloadButton = content.site.status.hasConstitution && content.constitution.pdfPath
    ? `<a href="${escapeAttr(content.constitution.pdfPath)}" class="btn btn--primary btn--lg" download>${icon('info')}Tüzüğü İndir</a>`
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
        <div class="status-banner" role="status" aria-live="polite" style="margin-bottom: var(--space-8);">
          <p><strong>${escapeHtml(content.constitution.statusStrong || 'Tüzük belgesi hazırlanma aşamasındadır.')}</strong><br>${escapeHtml(content.constitution.status)}</p>
        </div>
        <div class="alert alert--info" role="note" style="margin-bottom: var(--space-8);">
          ${icon('info')}
          <span>${escapeHtml(content.constitution.infoBanner || 'Tüzük belgesi hazır olduğunda bu sayfa güncellenecektir. Menü ve sayfa URL\'si değişmeyecektir.')}</span>
        </div>
        ${downloadButton}
        <h2 id="what-is-constitution" style="font-size: var(--text-xl); margin-bottom: var(--space-4);">${escapeHtml(content.constitution.infoTitle || 'Tüzük Nedir?')}</h2>
        ${infoParagraphs.map((paragraph, index) => `<p style="color: var(--color-text-muted); line-height: var(--leading-loose);${index < infoParagraphs.length - 1 ? ' margin-bottom: var(--space-4);' : ''}">${escapeHtml(paragraph)}</p>`).join('')}
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
  const mapQuery = (content.contact.geo?.lat && content.contact.geo?.lng) ? `${content.contact.geo.lat},${content.contact.geo.lng}` : content.contact.address?.full;
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
    ? `<div style="overflow:hidden;border-radius:var(--radius-xl);border:1px solid var(--color-border);background:var(--color-bg-alt);">
        <iframe src="${escapeAttr(mapEmbedSrc)}" title="${escapeAttr(`${content.site.name} Konumu`)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="width:100%;min-height:360px;border:0;"></iframe>
      </div>`
    : `<div class="map-placeholder" role="img" aria-label="Harita henüz etkin değil">
        ${icon('map')}
        <p><strong>${escapeHtml(content.contact.mapPlaceholderTitle || 'Harita yakında burada olacak.')}</strong><br>${escapeHtml(content.contact.mapPlaceholderText || 'Adres ve koordinat bilgisi doğrulandığında Google Haritalar görünümü bu alana eklenecektir.')}<br><br>Konum için lütfen şimdilik <a href="${escapeAttr(content.contact.phoneHref)}" style="color:var(--color-info-text);">telefonla iletişime geçin</a>.</p>
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
                ${content.contact.googleMapsUrl ? `<a href="${escapeAttr(content.contact.googleMapsUrl)}" class="btn btn--primary" target="_blank" rel="noopener noreferrer" id="directions-btn" aria-label="Google Haritalar'da yol tarifi al, yeni sekmede açılır">${icon('directions')}${escapeHtml(content.contact.directionsLabel || 'Yol Tarifi Al')}</a>` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>`
    : '';

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
              <div>
                <p class="contact-item__label">Telefon</p>
                <p class="contact-item__value"><a href="${escapeAttr(content.contact.phoneHref)}">${escapeHtml(content.contact.phone)}</a></p>
              </div>
            </article>
            <article class="contact-item" aria-label="E-posta iletişim bilgisi">
              <div class="contact-item__icon" aria-hidden="true">${icon('mail')}</div>
              <div>
                <p class="contact-item__label">E-posta</p>
                <p class="contact-item__value" style="font-size:0.85rem;"><a href="${escapeAttr(content.contact.emailHref)}">${escapeHtml(content.contact.email)}</a></p>
              </div>
            </article>
            ${addressCard}
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <a href="${escapeAttr(content.contact.phoneHref)}" class="btn btn--primary btn--lg" id="contact-call" aria-label="Telefon et: ${escapeAttr(content.contact.phone)}">${icon('phone')}Şimdi Ara: ${escapeHtml(content.contact.phone)}</a>
            <a href="${escapeAttr(content.contact.emailHref)}" class="btn btn--secondary btn--lg" id="contact-email">${icon('mail')}E-posta Gönder</a>
            ${content.contact.googleMapsUrl ? `<a href="${escapeAttr(content.contact.googleMapsUrl)}" class="btn btn--ghost btn--lg" id="contact-maps" target="_blank" rel="noopener noreferrer" aria-label="Google Haritalar'da aç, yeni sekmede açılır">${icon('map')}Haritada Ara${icon('external')}</a>` : ''}
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
      <p class="error-page__desc" id="error-desc">Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir. Endişelenmeyin, sizi doğru yere yönlendirebiliriz.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/" class="btn btn--primary btn--lg" id="error-home-btn">${icon('home')}Ana Sayfaya Dön</a>
        <a href="/iletisim" class="btn btn--secondary btn--lg" id="error-contact-btn">${icon('phone')}İletişime Geç</a>
      </div>
    </div>
  </div>`;
}

function renderPageContent(pageKey, content) {
  switch (pageKey) {
    case 'index':
      return renderIndexContent(content);
    case 'hakkimizda':
      return renderAboutContent(content);
    case 'tuzuk':
      return renderConstitutionContent(content);
    case 'iletisim':
      return renderContactContent(content);
    case 'notfound':
      return renderNotFoundContent(content);
    default:
      return '';
  }
}

function buildOrganizationSchema(content) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'NGO'],
    name: content.site.name,
    url: toAbsoluteUrl(content.site.url, '/'),
    description: content.site.description,
    contactPoint: [],
  };

  if (content.site.status.hasLogo && content.site.logoPath) {
    organization.logo = toAbsoluteUrl(content.site.url, content.site.logoPath);
  }

  if (content.contact.phone) {
    organization.contactPoint.push({
      '@type': 'ContactPoint',
      telephone: content.contact.phoneHref.replace('tel:', ''),
      contactType: 'customer support',
      availableLanguage: 'Turkish',
    });
  }

  if (content.contact.email) {
    organization.contactPoint.push({
      '@type': 'ContactPoint',
      email: content.contact.email,
      contactType: 'customer support',
    });
  }

  const socialLinks = Object.values(content.contact.social || {}).filter(Boolean);
  if (socialLinks.length > 0) {
    organization.sameAs = socialLinks;
  }

  if (content.site.status.hasAddress && content.contact.address?.full) {
    organization.address = {
      '@type': 'PostalAddress',
      streetAddress: content.contact.address.full,
      addressLocality: content.contact.address.city,
      postalCode: content.contact.address.postalCode,
      addressCountry: 'TR',
    };
  }

  return organization;
}

function buildLocalBusinessSchema(content) {
  if (!(content.site.status.hasAddress && content.site.status.hasGeoCoordinates && content.contact.geo?.lat && content.contact.geo?.lng)) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: content.site.name,
    telephone: content.contact.phone,
    email: content.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: content.contact.address.full,
      addressLocality: content.contact.address.city,
      postalCode: content.contact.address.postalCode,
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: content.contact.geo.lat,
      longitude: content.contact.geo.lng,
    },
    url: toAbsoluteUrl(content.site.url, '/'),
  };
}

function renderHead(pageKey, content) {
  const pageMeta = getPageMeta(pageKey, content);
  const pageUrl = pageMeta.canonical || toAbsoluteUrl(content.site.url, getPagePath(pageKey));
  const ogImageUrl = content.site.ogImagePath ? toAbsoluteUrl(content.site.url, content.site.ogImagePath) : null;
  const twitterCard = ogImageUrl ? 'summary_large_image' : 'summary';
  const appleTouchIcon = content.site.appleTouchIconPath
    ? `<link rel="apple-touch-icon" href="${escapeAttr(content.site.appleTouchIconPath)}" />`
    : '';

  const schemas = [
    renderJsonLd(buildOrganizationSchema(content)),
    buildLocalBusinessSchema(content) ? renderJsonLd(buildLocalBusinessSchema(content)) : '',
    pageMeta.breadcrumbs
      ? renderJsonLd({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: pageMeta.breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
          })),
        })
      : '',
    renderJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageMeta.webPageName,
      url: pageUrl,
      description: pageMeta.webPageDescription,
      inLanguage: 'tr-TR',
    }),
  ]
    .filter(Boolean)
    .join('\n');

  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#FFFFFF" />
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
  <link rel="stylesheet" href="/src/styles/main.css" />
  ${renderThemeBootstrap()}
  ${schemas}`;
}

export function renderPage(pageKey) {
  const content = readSiteContent();
  const currentPath = getPagePath(pageKey);
  const includeGlobalChrome = pageKey !== 'notfound';

  return `<!DOCTYPE html>
<html lang="${escapeAttr(content.site.language)}" data-theme="light">
<head>
  ${renderHead(pageKey, content)}
</head>
<body>
  ${pageKey === 'index' ? renderLoader(content) : ''}
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
  <script type="module" src="/src/scripts/main.js"></script>
</body>
</html>`;
}

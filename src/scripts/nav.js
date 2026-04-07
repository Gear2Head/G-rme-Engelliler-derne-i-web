/**
 * AMAÇ: Navigasyon davranışları — mobile menü, aktif link, klavye erişimi, back-to-top
 * MANTIK: Escape/dış tıklama/focus yönetimi ile erişilebilir mobil menü; scroll tabanlı görünürlük
 */

function initNav() {
  initMobileMenu();
  setActiveNavLink();
  initBackToTop();
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);

    if (isOpen) {
      const firstLink = mobileNav.querySelector('a');
      firstLink?.focus();
    }
  });

  mobileNav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open')
        && !mobileNav.contains(e.target)
        && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  function closeMenu() {
    mobileNav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    toggle.focus();
  }
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || '';
    const isActive = href === currentPath || (href !== '' && currentPath.startsWith(href));
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
    if (!isActive) link.removeAttribute('aria-current');
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function onScroll() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
    }
  });
}

export { initNav };

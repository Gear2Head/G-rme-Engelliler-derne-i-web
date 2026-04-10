

function initNav() {
  initMobileMenu();
  setActiveNavLink();
  initBackToTop();
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
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

  let touchStartX = 0;
  mobileNav.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  mobileNav.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientX - touchStartX > 60) closeMenu();
  }, { passive: true });

  mobileNav.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(mobileNav.querySelectorAll('a[href], button:not([disabled])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  function closeMenu() {
    mobileNav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    toggle.focus();
  }

  const footerBtn = document.getElementById('back-to-top-footer');
  if (footerBtn) {
    footerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || '';
    const isActive = href === '/' 
      ? currentPath === '/' 
      : currentPath === href || currentPath.startsWith(href + '/');
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

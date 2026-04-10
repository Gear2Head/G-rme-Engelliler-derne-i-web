

const STORAGE_KEYS = {
  fontSize:    'kged-font-size',
  grayscale:   'kged-grayscale',
  dyslexia:    'kged-dyslexia',
};

const FONT_SIZES = [100, 125, 150, 175, 200];
const FONT_SIZE_DEFAULT = 100;

function getStoredInt(key, fallback) {
  const raw = localStorage.getItem(key);
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function applyFontSize(size) {
  document.documentElement.style.fontSize = `${size}%`;
  const display = document.getElementById('toolbar-font-value');
  if (display) display.textContent = `${size}%`;
  updateFontSizeButtons(size);
}

function updateFontSizeButtons(size) {
  const decreaseBtn = document.getElementById('toolbar-font-decrease');
  const increaseBtn = document.getElementById('toolbar-font-increase');
  if (decreaseBtn) decreaseBtn.disabled = size <= FONT_SIZES[0];
  if (increaseBtn) increaseBtn.disabled = size >= FONT_SIZES[FONT_SIZES.length - 1];
}

function changeFontSize(direction) {
  const current = getStoredInt(STORAGE_KEYS.fontSize, FONT_SIZE_DEFAULT);
  const idx = FONT_SIZES.indexOf(current);
  const nextIdx = direction === 'increase'
    ? Math.min(idx + 1, FONT_SIZES.length - 1)
    : Math.max(idx - 1, 0);
  const nextSize = FONT_SIZES[nextIdx];
  localStorage.setItem(STORAGE_KEYS.fontSize, nextSize);
  applyFontSize(nextSize);
  announceChange(`Font boyutu %${nextSize} olarak değiştirildi`);
}

function applyGrayscale(enabled) {
  document.body.classList.toggle('grayscale', enabled);
  const btn = document.getElementById('toolbar-grayscale');
  if (btn) {
    btn.classList.toggle('active', enabled);
    btn.setAttribute('aria-pressed', String(enabled));
  }
}

function toggleGrayscale() {
  const current = localStorage.getItem(STORAGE_KEYS.grayscale) === 'true';
  const next = !current;
  localStorage.setItem(STORAGE_KEYS.grayscale, String(next));
  applyGrayscale(next);
  announceChange(next ? 'Gri ton modu etkin' : 'Gri ton modu devre dışı');
}

function applyDyslexia(enabled) {
  document.body.classList.toggle('dyslexia', enabled);
  const btn = document.getElementById('toolbar-dyslexia');
  if (btn) {
    btn.classList.toggle('active', enabled);
    btn.setAttribute('aria-pressed', String(enabled));
  }
}

function toggleDyslexia() {
  const current = localStorage.getItem(STORAGE_KEYS.dyslexia) === 'true';
  const next = !current;
  localStorage.setItem(STORAGE_KEYS.dyslexia, String(next));
  applyDyslexia(next);
  announceChange(next ? 'Disleksi dostu font etkin' : 'Disleksi dostu font devre dışı');
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEYS.fontSize);
  localStorage.removeItem(STORAGE_KEYS.grayscale);
  localStorage.removeItem(STORAGE_KEYS.dyslexia);
  applyFontSize(FONT_SIZE_DEFAULT);
  applyGrayscale(false);
  applyDyslexia(false);
  announceChange('Tüm erişilebilirlik ayarları sıfırlandı');
}

function announceChange(message) {
  let region = document.getElementById('a11y-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'a11y-announcer';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
    document.body.appendChild(region);
  }
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

function hydrateToolbar() {
  applyFontSize(getStoredInt(STORAGE_KEYS.fontSize, FONT_SIZE_DEFAULT));
  applyGrayscale(localStorage.getItem(STORAGE_KEYS.grayscale) === 'true');
  applyDyslexia(localStorage.getItem(STORAGE_KEYS.dyslexia) === 'true');
}

function initToolbar() {
  hydrateToolbar();

  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');
  if (prefersHighContrast.matches && !localStorage.getItem('kged-theme')) {
    document.documentElement.setAttribute('data-theme', 'high-contrast');
  }
  prefersHighContrast.addEventListener('change', e => {
    if (e.matches && !localStorage.getItem('kged-theme')) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    }
  });

  const toggle = document.getElementById('toolbar-toggle');
  const panel  = document.getElementById('toolbar-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Erişilebilirlik araç çubuğunu kapat' : 'Erişilebilirlik araç çubuğunu aç');
    });

    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.getElementById('toolbar-font-decrease')
    ?.addEventListener('click', () => changeFontSize('decrease'));
  document.getElementById('toolbar-font-increase')
    ?.addEventListener('click', () => changeFontSize('increase'));
  document.getElementById('toolbar-grayscale')
    ?.addEventListener('click', toggleGrayscale);
  document.getElementById('toolbar-dyslexia')
    ?.addEventListener('click', toggleDyslexia);
  document.getElementById('toolbar-reset')
    ?.addEventListener('click', resetAll);

  document.addEventListener('keydown', e => {
    if (e.altKey && (e.key === 'a' || e.key === 'A') && panel && toggle) {
      e.preventDefault();
      const isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) panel.querySelector('button, [tabindex]')?.focus();
      else toggle.focus();
    }
  });
}

export { initToolbar, hydrateToolbar };

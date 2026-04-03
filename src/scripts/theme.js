/**
 * AMAÇ: Tema yönetimi — sistem tercihi algılama, localStorage kalıcılığı, geçiş animasyonu
 * MANTIK: data-theme attribute ile CSS token'ları tetiklenir; MutationObserver gereksiz
 */

const STORAGE_KEY = 'kged-theme';
const THEMES = ['light', 'dark', 'high-contrast'];

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

function applyTheme(theme) {
  const resolved = THEMES.includes(theme) ? theme : getSystemTheme();
  document.documentElement.setAttribute('data-theme', resolved);
  updateThemeToggleButtons(resolved);
  updateMetaThemeColor(resolved);
}

function updateMetaThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const colors = { light: '#FFFFFF', dark: '#0F1117', 'high-contrast': '#000000' };
  meta.setAttribute('content', colors[theme] ?? colors.light);
}

function updateThemeToggleButtons(activeTheme) {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const targetTheme = btn.dataset.themeToggle;
    btn.classList.toggle('active', activeTheme === targetTheme);
    btn.setAttribute('aria-pressed', activeTheme === targetTheme);
  });
}

function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

function initTheme() {
  const stored = getStoredTheme();
  applyTheme(stored || getSystemTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
    }
  });

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.dataset.themeToggle;
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === targetTheme ? 'light' : targetTheme);
    });
  });
}

export { initTheme, setTheme, toggleTheme };

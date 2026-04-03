/**
 * AMAÇ: JavaScript giriş noktası — tüm modülleri sırayla başlatır
 * MANTIK: Tema ve toolbar önce hydrate edilir (flash önleme); loader ve nav DOM hazır olunca çalışır
 */
import '../styles/main.css';

import { initTheme } from './theme.js';
import { initToolbar } from './toolbar.js';
import { initLoader } from './loader.js';
import { initNav } from './nav.js';

initTheme();
initToolbar();

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

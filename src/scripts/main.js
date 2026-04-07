/**
 * AMAÇ: JavaScript giriş noktası — tüm modülleri sırayla başlatır
 * MANTIK: Tema ve toolbar önce hydrate edilir (flash önleme); loader ve nav DOM hazır olunca çalışır
 */

import '../styles/main.css';
import { initTheme } from './theme.js';
import { initToolbar } from './toolbar.js';
import { initLoader } from './loader.js';
import { initNav } from './nav.js';

// FOUC prevention: reveal body after CSS is parsed
document.body.classList.add('ready');

initTheme();
initToolbar();

// Vercel Speed Insights (production only, dynamic to avoid build issues)
if (import.meta.env.PROD) {
  import('@vercel/speed-insights').then(({ inject }) => inject()).catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // KVKK Cookie consent banner (show once)
  if (!localStorage.getItem('kged-kvkk-accepted')) {
    const banner = document.createElement('div');
    banner.id = 'kvkk-banner';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:1500;background:var(--color-bg-card,#1e1b4b);color:var(--color-text,#e0e7ff);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-top:2px solid var(--color-primary-500,#6366f1);box-shadow:0 -4px 24px rgba(0,0,0,0.3);';
    banner.innerHTML = '<p style="margin:0;font-size:0.875rem;flex:1;">Bu site kullanıcı tercihlerini saklamak için <strong>tarayıcı deposu (localStorage)</strong> kullanmaktadır. Kişisel verileriniz üçüncü taraflarla paylaşılmaz. <a href="/tuzuk" style="color:var(--color-primary-300,#a5b4fc);text-decoration:underline;">Daha fazla bilgi</a></p><button id="kvkk-accept" style="padding:0.5rem 1.25rem;background:var(--color-primary-600,#4f46e5);color:#fff;border:none;border-radius:999px;cursor:pointer;font-size:0.875rem;font-weight:600;white-space:nowrap;flex-shrink:0;">Anladım</button>';
    document.body.appendChild(banner);
    document.getElementById('kvkk-accept').addEventListener('click', () => {
      localStorage.setItem('kged-kvkk-accepted', '1');
      banner.remove();
    });
  }
});

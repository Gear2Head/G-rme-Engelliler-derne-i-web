

import '../styles/main.css';
import { initTheme } from './theme.js';
import { initToolbar } from './toolbar.js';
import { initLoader } from './loader.js';
import { initNav } from './nav.js';
import { showToast } from './toast.js';
import { initHydration } from './hydrate.js';

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reduced-motion');
}

if (!('scrollBehavior' in document.documentElement.style)) {
  import('https://cdnjs.cloudflare.com/ajax/libs/smoothscroll/1.4.10/smoothscroll.min.js').catch(() => {});
}

document.body.classList.add('ready');

initTheme();
initToolbar();

if (import.meta.env.PROD) {
  import('@vercel/speed-insights').then(({ inject }) => inject()).catch(() => {});
  import('@vercel/analytics').then(({ inject }) => inject()).catch(() => {});

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

document.addEventListener('kged:toast', (e) => {
  showToast(e.detail.message, e.detail.type, e.detail.duration);
});
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initHydration();

  document.querySelectorAll('.footer-year-display').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

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

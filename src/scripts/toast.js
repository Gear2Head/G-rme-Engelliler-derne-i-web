/**
 * AMAÇ: Hafif toast bildirim sistemi — başarı, hata, bilgi mesajları
 * MANTIK: DOM'a geçici alert div ekler, 3s sonra kaldırır; ARIA live region ile ekran okuyucu uyumlu
 */

let _container = null;

function getContainer() {
  if (!_container) {
    _container = document.createElement('div');
    _container.className = 'toast-container';
    _container.setAttribute('role', 'region');
    _container.setAttribute('aria-label', 'Bildirimler');
    document.body.appendChild(_container);
  }
  return _container;
}

/**
 * @param {string} message - Bildirim mesajı
 * @param {'success'|'error'|'info'} [type='info'] - Bildirim türü
 * @param {number} [duration=3500] - ms cinsinden gösterim süresi
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };

  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });

  return { remove };
}

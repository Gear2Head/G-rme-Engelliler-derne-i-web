// src/scripts/gallery-page.js — Vite-bundled gallery runtime
import { getGalleryItems } from '../supabase/gallery.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

const catColors = { etkinlik: '#4F46E5', toplanti: '#16A34A', egitim: '#D97706', ziyaret: '#0891B2', diger: '#6B7280' };
const catLabels = { etkinlik: 'Etkinlik', toplanti: 'Toplantı', egitim: 'Eğitim', ziyaret: 'Ziyaret', diger: 'Diğer' };

let galleryItems = [];
let currentFilter = 'all';
let lbItems = [];
let lbIndex = -1;
let lbContextItems = [];

function renderGalleryItem(item) {
  const cat = item.category || 'etkinlik';
  const src = item.url || item.imageData || '';
  const cap = item.caption || '';
  const alt = item.alt_text || cap || 'KGED Galeri Görseli';
  const label = catLabels[cat] || 'Diğer';
  const color = catColors[cat] || '#6B7280';
  const lid = item.id;

  const imgHtml = src
    ? `<img class="gallery-card__img" data-src="${escapeHtml(src)}"
         src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
         alt="${escapeHtml(alt)}"
         onclick="window.openLightbox('${lid}', '${escapeHtml(item.album_id || '')}')"
         style="cursor:pointer;" />`
    : `<div class="gallery-card__img-placeholder" aria-label="${escapeHtml(alt)}">${escapeHtml(cap) || 'Görsel'}</div>`;

  let dateHtml = '';
  const d = item.created_at || item.createdAt;
  if (d) {
    dateHtml = `<p class="gallery-card__date">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>${new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>`;
  }

  return `<article class="gallery-card" data-category="${cat}">
    ${imgHtml}
    <div class="gallery-card__body">
      <span class="gallery-card__cat" style="background:${color};" aria-label="Kategori: ${label}">${label}</span>
      ${cap ? `<p class="gallery-card__title">${escapeHtml(cap)}</p>` : ''}
      ${dateHtml}
    </div>
  </article>`;
}

function renderGalleryPage() {
  const grid = document.getElementById('gallery-page-grid');
  if (!grid) return;

  lbItems = currentFilter === 'all'
    ? galleryItems
    : galleryItems.filter(i => (i.category || 'etkinlik') === currentFilter);

  if (lbItems.length === 0) {
    grid.innerHTML = `<div class="gallery-empty" style="grid-column:1/-1;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <p style="font-size:var(--text-lg);font-weight:600;margin-bottom:8px;">Henüz görsel eklenmemiş</p>
      <p style="font-size:var(--text-sm);">${currentFilter !== 'all' ? 'Bu kategoride görsel bulunmuyor.' : 'Aktivitelerimizden kareler yakında burada yer alacaktır.'}</p>
    </div>`;
    return;
  }

  const ungrouped = [];
  const albums = {};
  lbItems.forEach(item => {
    if (item.album_id) {
      if (!albums[item.album_id]) albums[item.album_id] = [];
      albums[item.album_id].push(item);
    } else {
      ungrouped.push(item);
    }
  });

  let html = '';
  for (const [albumName, aItems] of Object.entries(albums)) {
    if (!aItems.length) continue;
    html += `<div class="gallery-album-wrap">
      <div class="gallery-album-header" data-album-toggle>
        <div class="gallery-album-title">
          📁 ${escapeHtml(albumName)}
          <span class="gallery-album-badge">${aItems.length} Görsel</span>
        </div>
        <svg class="gallery-album-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="gallery-album-grid">${aItems.map(renderGalleryItem).join('')}</div>
    </div>`;
  }
  if (ungrouped.length > 0) html += ungrouped.map(renderGalleryItem).join('');

  grid.innerHTML = html;

  // Event delegation for album toggle
  grid.querySelectorAll('[data-album-toggle]').forEach(header => {
    header.addEventListener('click', () => header.parentElement.classList.toggle('expanded'));
  });

  initIntersectionObserver();
}

// ─── FILTER ───
window.filterGallery = function (btn, cat) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = cat;
  renderGalleryPage();
};

// ─── LIGHTBOX ───
function updateLightboxState() {
  const items = lbContextItems.length > 0 ? lbContextItems : lbItems;
  if (lbIndex < 0 || lbIndex >= items.length) return;
  const item = items[lbIndex];
  const src = item.url || item.imageData || '';
  const cap = item.caption || '';

  const imgEl = document.getElementById('lightbox-img');
  const capEl = document.getElementById('lightbox-caption');
  if (!imgEl || !capEl) return;

  imgEl.style.opacity = '0.5';
  capEl.style.opacity = '0';

  setTimeout(() => {
    imgEl.src = src;
    imgEl.alt = cap || 'Görsel';
    capEl.textContent = item.album_id ? `[📁 ${item.album_id}] ${cap}` : cap;
    imgEl.style.opacity = '1';
    capEl.style.opacity = '1';
  }, 150);

  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');
  if (prev) prev.style.display = lbIndex > 0 ? 'flex' : 'none';
  if (next) next.style.display = lbIndex < items.length - 1 ? 'flex' : 'none';
}

window.openLightbox = function (id, albumContext) {
  if (albumContext) {
    lbContextItems = lbItems.filter(i => (i.album_id || '') === albumContext);
  } else {
    lbContextItems = lbItems;
  }
  lbIndex = lbContextItems.findIndex(i => String(i.id) === String(id));
  if (lbIndex === -1) {
    lbContextItems = lbItems;
    lbIndex = lbItems.findIndex(i => String(i.id) === String(id));
  }
  if (lbIndex === -1) return;
  const lb = document.getElementById('gallery-lightbox');
  if (!lb) return;
  updateLightboxState();
  lb.classList.add('open');
  lb.focus();
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
  const lb = document.getElementById('gallery-lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
  lbIndex = -1;
  lbContextItems = [];
};

window.navLightbox = function (dir) {
  const items = lbContextItems.length > 0 ? lbContextItems : lbItems;
  const newIdx = lbIndex + dir;
  if (newIdx >= 0 && newIdx < items.length) {
    lbIndex = newIdx;
    updateLightboxState();
  }
};

// ─── LAZY LOAD ───
function initIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return;
  const lazyImages = document.querySelectorAll('.gallery-card__img[data-src]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '0px 0px 200px 0px', threshold: 0.01 });
  lazyImages.forEach(img => observer.observe(img));
}

// ─── INIT ───
async function initGallery() {
  const grid = document.getElementById('gallery-page-grid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);font-weight:500;">Görseller Yükleniyor...</div>';

  try {
    const items = await getGalleryItems();
    galleryItems = Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('[KGED] Galeri yükleme hatası:', err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 1rem;color:var(--color-text-faint);"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <p style="font-weight:600;margin-bottom:0.5rem;">Görseller yüklenirken bir hata oluştu</p>
      <p style="font-size:0.875rem;color:var(--color-text-muted);margin-bottom:1rem;">Lütfen internet bağlantınızı kontrol edin.</p>
      <button onclick="window.__initGallery()" style="padding:0.625rem 1.5rem;background:var(--color-primary-600);color:#fff;border:none;border-radius:9999px;cursor:pointer;font-weight:600;font-size:0.875rem;">Tekrar Dene</button>
    </div>`;
    return;
  }

  renderGalleryPage();

  // Lightbox: click outside to close
  const lb = document.getElementById('gallery-lightbox');
  if (lb) {
    lb.addEventListener('click', e => { if (e.target === lb) window.closeLightbox(); });

    // Touch swipe
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) window.navLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!document.getElementById('gallery-lightbox')?.classList.contains('open')) return;
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowRight') window.navLightbox(1);
    if (e.key === 'ArrowLeft') window.navLightbox(-1);
  });
}

window.__initGallery = initGallery;
initGallery();

/**
 * DOSYA: src/scripts/admin-link-preview.js
 *
 * KULLANIM:
 *   import { initLinkPreview, getLinkPreviewData } from './admin-link-preview.js';
 *
 *   // Duyuru form render edildikten sonra çağır:
 *   initLinkPreview(annId);
 *
 *   // Kaydetmeden önce preview datasını al:
 *   const preview = getLinkPreviewData(annId); // null veya obje
 */

const PREVIEW_ENDPOINT = '/api/fetch-preview';

// Her duyuru id'si için preview verisini bellekte tut
const _previewStore = new Map();

/**
 * Belirtilen duyuru id'si için link preview UI'ını başlatır.
 * HTML'de bu id'lerin mevcut olduğunu varsayar — renderAnnCard() içinde üretilmeli.
 *
 * @param {string} annId  — duyuru id'si (örn. "ann-abc123")
 * @param {object|null} existingPreview — eğer varsa mevcut kayıtlı preview
 */
export function initLinkPreview(annId, existingPreview = null) {
  const urlInput = _el(`lp-url-${annId}`);
  const fetchBtn = _el(`lp-btn-${annId}`);
  const clearBtn = _el(`lp-clear-${annId}`);

  if (!urlInput || !fetchBtn) return;

  // Varsa mevcut preview'ı göster
  if (existingPreview) {
    _previewStore.set(annId, existingPreview);
    _showPreview(annId, existingPreview);
  }

  // URL input — Enter tuşu ile de tetikle
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      _doFetch(annId);
    }
  });

  // Önizle butonu
  fetchBtn.addEventListener('click', () => _doFetch(annId));

  // Kaldır butonu
  clearBtn?.addEventListener('click', () => _clearPreview(annId));
}

/**
 * Kaydedilecek preview datasını döndürür.
 * @returns {object|null}
 */
export function getLinkPreviewData(annId) {
  return _previewStore.get(annId) ?? null;
}

/** Mevcut annId için store'u temizler (kaydetme sonrası cleanup için) */
export function clearLinkPreviewStore(annId) {
  _previewStore.delete(annId);
}

// ─── private ─────────────────────────────────────────────

async function _doFetch(annId) {
  const urlInput = _el(`lp-url-${annId}`);
  const url = urlInput?.value?.trim() ?? '';

  _setError(annId, '');

  if (!url) {
    _setError(annId, 'Lütfen bir URL girin.');
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    _setError(annId, "URL https:// veya http:// ile başlamalı.");
    return;
  }

  _setLoading(annId, true);
  _hidePreview(annId);

  try {
    const res = await fetch(`${PREVIEW_ENDPOINT}?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }

    _previewStore.set(annId, data);
    _showPreview(annId, data);
  } catch (err) {
    // API çalışmıyorsa (local geliştirme) — sadece URL'i kaydet
    const fallback = {
      url,
      title: url,
      description: '',
      image: null,
      siteName: (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; } })(),
      fetchedAt: Date.now(),
      _fallback: true,
    };
    _previewStore.set(annId, fallback);
    _setError(annId, `Önizleme yüklenemedi (${err.message}). URL kaydedildi, detay sayfasına yönlendirme çalışacak.`);
  } finally {
    _setLoading(annId, false);
  }
}

function _showPreview(annId, data) {
  const wrap = _el(`lp-preview-${annId}`);
  if (!wrap) return;

  const img = _el(`lp-img-${annId}`);
  const title = _el(`lp-title-${annId}`);
  const desc = _el(`lp-desc-${annId}`);
  const site = _el(`lp-site-${annId}`);

  if (img) {
    if (data.image) {
      img.src = data.image;
      img.style.display = 'block';
      img.onerror = () => { img.style.display = 'none'; };
    } else {
      img.style.display = 'none';
    }
  }
  if (title) title.textContent = data.title ?? '';
  if (desc) desc.textContent = data.description ?? '';
  if (site) site.textContent = `🔗 ${data.siteName ?? ''}`;

  wrap.style.display = 'flex';
}

function _hidePreview(annId) {
  const wrap = _el(`lp-preview-${annId}`);
  if (wrap) wrap.style.display = 'none';
}

function _clearPreview(annId) {
  _previewStore.delete(annId);
  _hidePreview(annId);
  const urlInput = _el(`lp-url-${annId}`);
  if (urlInput) urlInput.value = '';
  _setError(annId, '');
}

function _setLoading(annId, on) {
  const btn = _el(`lp-btn-${annId}`);
  const spinner = _el(`lp-loading-${annId}`);
  if (btn) {
    btn.disabled = on;
    btn.textContent = on ? '...' : 'Önizle';
  }
  if (spinner) spinner.style.display = on ? 'block' : 'none';
}

function _setError(annId, msg) {
  const el = _el(`lp-error-${annId}`);
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

function _el(id) {
  return document.getElementById(id);
}


// ─── HTML FACTORY ─────────────────────────────────────────
/**
 * Bir duyuru kartı içine yerleştirilecek link-preview bloğunun HTML'ini üretir.
 *
 * Kullanım (admin renderAnnCard içinde):
 *   formHtml += renderLinkPreviewBlock(ann.id, ann.linkPreview);
 *
 * @param {string} annId
 * @param {object|null} existing — kayıtlı linkPreview objesi
 */
export function renderLinkPreviewBlock(annId, existing = null) {
  const url = existing?.url ?? '';
  const hasPreview = Boolean(existing?.title);

  return /* html */`
<div class="lp-block" style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid #E2E8F0;">

  <label style="display:block;font-size:0.75rem;font-weight:700;color:#64748B;
                text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;">
    Haber Kaynağı Linki
    <span style="font-weight:400;color:#94A3B8;text-transform:none;">(opsiyonel)</span>
  </label>

  <p style="font-size:.78rem;color:#94A3B8;margin-bottom:.6rem;">
    Bir haber URL'si girerseniz başlık, açıklama ve görsel otomatik çekilir.
    Kullanıcılar duyuruya tıkladığında o sayfaya yönlendirilir.
  </p>

  <!-- URL Satırı -->
  <div style="display:flex;gap:.5rem;align-items:center;">
    <input
      type="url"
      id="lp-url-${annId}"
      placeholder="https://kaynakhaber.com/haber-basligi"
      value="${_escAttr(url)}"
      autocomplete="off"
      style="flex:1;height:42px;padding:0 .75rem;border:1.5px solid #CBD5E1;border-radius:8px;
             font-size:.875rem;font-family:inherit;outline:none;background:#fff;
             transition:border-color 150ms;"
      onfocus="this.style.borderColor='#6366F1'"
      onblur="this.style.borderColor='#CBD5E1'"
    />
    <button
      type="button"
      id="lp-btn-${annId}"
      style="height:42px;padding:0 1rem;background:#4F46E5;color:#fff;border:none;
             border-radius:8px;font-size:.85rem;font-weight:600;cursor:pointer;
             white-space:nowrap;transition:background 150ms;flex-shrink:0;"
      onmouseover="this.style.background='#4338CA'"
      onmouseout="this.style.background='#4F46E5'"
    >Önizle</button>
    <button
      type="button"
      id="lp-clear-${annId}"
      title="Linki kaldır"
      style="height:42px;padding:0 .6rem;background:transparent;border:1.5px solid #CBD5E1;
             border-radius:8px;color:#94A3B8;cursor:pointer;font-size:.85rem;transition:all 150ms;flex-shrink:0;"
      onmouseover="this.style.borderColor='#EF4444';this.style.color='#EF4444'"
      onmouseout="this.style.borderColor='#CBD5E1';this.style.color='#94A3B8'"
    >✕</button>
  </div>

  <!-- Yükleniyor -->
  <p id="lp-loading-${annId}"
     style="display:none;font-size:.8rem;color:#6366F1;margin-top:.4rem;">
    ⏳ Sayfa bilgileri çekiliyor…
  </p>

  <!-- Hata -->
  <p id="lp-error-${annId}"
     style="display:none;font-size:.78rem;color:#DC2626;margin-top:.4rem;line-height:1.4;">
  </p>

  <!-- Önizleme Kartı -->
  <div
    id="lp-preview-${annId}"
    style="display:${hasPreview ? 'flex' : 'none'};gap:.75rem;align-items:flex-start;
           margin-top:.75rem;padding:.75rem;border:1.5px solid #C7D2FE;border-radius:10px;
           background:#F5F3FF;"
  >
    <img
      id="lp-img-${annId}"
      src="${_escAttr(existing?.image ?? '')}"
      alt=""
      style="width:88px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0;
             background:#E2E8F0;display:${existing?.image ? 'block' : 'none'};"
    />
    <div style="flex:1;min-width:0;">
      <p id="lp-title-${annId}"
         style="font-weight:700;font-size:.85rem;margin-bottom:2px;color:#1E293B;
                overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
        ${_escHtml(existing?.title ?? '')}
      </p>
      <p id="lp-desc-${annId}"
         style="font-size:.75rem;color:#64748B;overflow:hidden;display:-webkit-box;
                -webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:3px;">
        ${_escHtml(existing?.description ?? '')}
      </p>
      <p id="lp-site-${annId}"
         style="font-size:.7rem;color:#818CF8;font-weight:600;">
        ${existing?.siteName ? `🔗 ${_escHtml(existing.siteName)}` : ''}
      </p>
    </div>
  </div>

</div>`;
}

function _escAttr(s) {
  return String(s ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

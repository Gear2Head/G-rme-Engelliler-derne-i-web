import { getSiteConfig } from '../supabase/site_config.js';

/**
 * Bu modül, Supabase'deki 'site_config' verilerini okur ve 
 * statik HTML üzerinde canlı güncelleme (hydration) yapar.
 */
export async function initHydration() {
  try {
    const config = await getSiteConfig();
    if (!config) return;

    // 1. Hero Bölümü
    updateText('live-hero-title', config.hero?.title);
    updateText('live-hero-subtitle', config.hero?.subtitle);
    updateText('live-hero-lead', config.hero?.lead);
    updateText('live-hero-cta-label', config.hero?.cta?.primary?.label);

    // 2. Hakkımızda Sayfası
    updateText('live-about-page-title', config.about?.title);
    updateText('live-about-page-lead', config.about?.pageLead);
    updateText('live-about-intro-heading', config.about?.introHeading);
    updateText('live-about-intro', config.about?.intro);
    updateText('live-about-description', config.about?.description);

    // 3. Yönetim Kurulu (Özel Render)
    if (config.board && config.board.length > 0) {
      const container = document.getElementById('live-board-container');
      if (container) {
        container.innerHTML = `
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);padding:var(--space-6);box-shadow:var(--shadow-sm);">
            <ul style="list-style:none;padding:0;margin:0;display:grid;gap:var(--space-4);">
              ${config.board.map((member, idx) => `
                <li style="display:flex;align-items:center;gap:var(--space-4);padding-bottom:${idx === config.board.length - 1 ? '0' : 'var(--space-4)'};border-bottom:${idx === config.board.length - 1 ? 'none' : '1px solid var(--color-border)'};">
                  <div style="width:40px;height:40px;background:var(--color-primary-100);color:var(--color-primary-700);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${idx + 1}</div>
                  <div style="flex:1;">
                    <p style="font-weight:600;color:var(--color-text);margin-bottom:0.25rem;">${escapeHtml(member.name)}</p>
                    <p style="font-size:0.85rem;color:var(--color-text-muted);">${escapeHtml(member.role)}</p>
                  </div>
                </li>`).join('')}
            </ul>
          </div>`;
      }
    }

  } catch (err) {
    console.warn('[KGED] Hydrate hatası (site statik verilerle devam ediyor):', err);
  }
}

function updateText(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

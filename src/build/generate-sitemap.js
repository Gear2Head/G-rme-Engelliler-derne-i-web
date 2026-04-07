/**
 * TODO 47: Sitemap.xml otomatik üretimi
 * Vite plugin olarak çalışır — build tamamlandığında public/sitemap.xml üretir
 */

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://kirshehirgormeengelliler.org.tr';

const PAGES = [
  { loc: '/',           priority: '1.0', changefreq: 'weekly'  },
  { loc: '/hakkimizda', priority: '0.8', changefreq: 'monthly' },
  { loc: '/galeri/',    priority: '0.9', changefreq: 'weekly'  },
  { loc: '/tuzuk/',     priority: '0.7', changefreq: 'yearly'  },
  { loc: '/iletisim/',  priority: '0.8', changefreq: 'monthly' },
];

export function generateSitemapPlugin() {
  return {
    name: 'kged-sitemap',
    closeBundle() {
      const now = new Date().toISOString().split('T')[0];
      const urls = PAGES.map(p => `
  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

      const outPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
      fs.writeFileSync(outPath, xml, 'utf8');
      console.log('[KGED] ✓ sitemap.xml oluşturuldu →', outPath);
    }
  };
}

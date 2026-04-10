import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://kirged.org';

function slugify(text) {
  const trMap = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O' };
  return text.toString().toLowerCase()
    .replace(/[çÇğĞşŞüÜıİöÖ]/g, m => trMap[m])
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateSitemapPlugin() {
  return {
    name: 'kged-sitemap',
    closeBundle() {
      const dataPath = path.resolve(process.cwd(), 'src/data/site-content.json');
      let siteContent = null;
      try {
        siteContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      } catch (e) {
        console.error('[KGED] sitemap okunurken hata', e.message);
        return;
      }
      
      const now = new Date().toISOString().split('T')[0];
      const pages = [
        { loc: '', priority: '1.0', changefreq: 'weekly' },
        { loc: '/hakkimizda', priority: '0.8', changefreq: 'monthly' },
        { loc: '/galeri', priority: '0.9', changefreq: 'weekly' },
        { loc: '/duyurular', priority: '0.9', changefreq: 'weekly' },
        { loc: '/tuzuk', priority: '0.7', changefreq: 'yearly' },
        { loc: '/iletisim', priority: '0.8', changefreq: 'monthly' },
      ];

      // Add dynamic announcement URLs
      const announcements = siteContent.announcements || [];
      announcements.forEach(a => {
        pages.push({
          loc: `/duyurular/${slugify(a.title)}`,
          priority: '0.6',
          changefreq: 'monthly'
        });
      });

      const urls = pages.map(p => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      const outPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
      fs.writeFileSync(outPath, xml, 'utf8');
      console.log('[KGED] ✓ sitemap.xml oluşturuldu →', outPath);
    }
  };
}

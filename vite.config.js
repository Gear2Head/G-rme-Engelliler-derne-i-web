import { resolve } from 'path';
import { defineConfig } from 'vite';
import { renderDocumentFragments } from './src/build/site-renderer.js';
import { generateSitemapPlugin } from './src/build/generate-sitemap.js';
import fs from 'fs';

function resolvePageKey(context) {
  const original = context?.originalUrl || context?.url || '/';
  const rawPath = context?.filename || original;
  let normalized = String(rawPath).replace(/\\/g, '/').split('?')[0];

  if (normalized.endsWith('/404.html') || normalized === '/404.html') return 'notfound';
  
  // Announcement detail check
  const checkUrl = String(original).split('?')[0];
  if (checkUrl.startsWith('/duyurular/') && checkUrl !== '/duyurular/' && !checkUrl.endsWith('/index.html') && !checkUrl.endsWith('detay.html')) {
    let slug = checkUrl.replace('/duyurular/', '').replace(/\//g, '');
    if (slug && slug !== 'index') {
      return `announcement:${slug}`;
    }
  }

  if (normalized.includes('/hakkimizda')) return 'hakkimizda';
  if (normalized.includes('/galeri')) return 'galeri';
  if (normalized.includes('/tuzuk')) return 'tuzuk';
  if (normalized.includes('/duyurular')) return 'duyurular';
  if (normalized.includes('/iletisim')) return 'iletisim';

  return 'index';
}

function slugify(text) {
  if (!text) return '';
  const trMap = { 'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U', 'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O' };
  return text.toString().toLowerCase()
    .replace(/[çÇğĞşŞüÜıİöÖ]/g, m => trMap[m])
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getAnnouncementsInfo() {
  const dataPath = resolve(__dirname, 'src/data/site-content.json');
  try {
    const content = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return (content.announcements || []).map(ann => ({
      slug: slugify(ann.title),
      title: ann.title
    }));
  } catch (e) {
    console.warn('[Vite Config] Announcement load failed:', e.message);
    return [];
  }
}

function siteContentPlugin() {
  return {
    name: 'site-content-build-renderer',
    transformIndexHtml(html, context) {
      const { head, body } = renderDocumentFragments(resolvePageKey(context));
      return html
        .replace('<!--app-head-->', head)
        .replace('<!--app-body-->', body);
    },
  };
}

function devRewritePlugin() {
  return {
    name: 'dev-rewrite-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Rewrite /duyurular/:slug to /duyurular/detay.html for local dev
        if (req.url.startsWith('/duyurular/') && req.url !== '/duyurular/' && !req.url.includes('.')) {
          req.url = '/duyurular/detay.html';
        }
        next();
      });
    }
  };
}

const announcements = getAnnouncementsInfo();
const announcementInputs = {};
announcements.forEach(ann => {
  announcementInputs[`duyurular/${ann.slug}/index`] = resolve(__dirname, 'duyurular/detay.html');
});

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  plugins: [devRewritePlugin(), siteContentPlugin(), generateSitemapPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hakkimizda: resolve(__dirname, 'hakkimizda/index.html'),
        galeri: resolve(__dirname, 'galeri/index.html'),
        tuzuk: resolve(__dirname, 'tuzuk/index.html'),
        duyurular: resolve(__dirname, 'duyurular/index.html'),
        iletisim: resolve(__dirname, 'iletisim/index.html'),
        notfound: resolve(__dirname, '404.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        ...announcementInputs
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
// Force restart 


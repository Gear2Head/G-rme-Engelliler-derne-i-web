import { resolve } from 'path';
import { defineConfig } from 'vite';
import { renderDocumentFragments } from './src/build/site-renderer.js';
import { generateSitemapPlugin } from './src/build/generate-sitemap.js';

function resolvePageKey(context) {
  const rawPath = context?.originalUrl || context?.url || context?.path || context?.filename || '/';
  const normalized = String(rawPath).replace(/\\/g, '/').split('?')[0];

  if (normalized.endsWith('/404.html') || normalized === '/404.html') return 'notfound';
  if (normalized.includes('/hakkimizda')) return 'hakkimizda';
  if (normalized.includes('/galeri')) return 'galeri';
  if (normalized.includes('/tuzuk')) return 'tuzuk';
  if (normalized.includes('/iletisim')) return 'iletisim';

  return 'index';
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

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  plugins: [siteContentPlugin(), generateSitemapPlugin()],
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
        iletisim: resolve(__dirname, 'iletisim/index.html'),
        notfound: resolve(__dirname, '404.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
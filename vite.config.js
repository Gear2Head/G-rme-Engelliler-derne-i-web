import { resolve } from 'path';
import { defineConfig } from 'vite';
import { renderPage } from './src/build/site-renderer.js';

function resolvePageKey(context) {
  const rawPath = context?.originalUrl || context?.url || context?.path || context?.filename || '/';
  const normalized = String(rawPath).replace(/\\/g, '/').split('?')[0];

  if (normalized.endsWith('/404.html') || normalized === '/404.html') return 'notfound';
  if (normalized.includes('/hakkimizda')) return 'hakkimizda';
  if (normalized.includes('/tuzuk')) return 'tuzuk';
  if (normalized.includes('/iletisim')) return 'iletisim';

  return 'index';
}

function siteContentPlugin() {
  return {
    name: 'site-content-build-renderer',
    transformIndexHtml(_html, context) {
      return renderPage(resolvePageKey(context));
    },
  };
}

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  plugins: [siteContentPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hakkimizda: resolve(__dirname, 'hakkimizda/index.html'),
        tuzuk: resolve(__dirname, 'tuzuk/index.html'),
        iletisim: resolve(__dirname, 'iletisim/index.html'),
        notfound: resolve(__dirname, '404.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

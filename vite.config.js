/**
 * AMAÇ: Vite MPA (Multi-Page Application) yapılandırması
 * MANTIK: Her HTML dosyası bağımsız bir giriş noktasıdır; ortak CSS/JS varlıkları chunk olarak bölünür
 */
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
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
})

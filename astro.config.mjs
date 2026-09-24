// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { linkweb, id } from './src/wii.js';

// https://astro.build/config
export default defineConfig({
  // CONFIGURACIÓN BASE (Dominio canónico y compresión extrema HTML)
  site: linkweb,
  base: '/',
  compressHTML: true,

  // COMPILACIÓN DE ESTILOS E IMÁGENES (Inyección de hojas críticas y passthrough de imágenes)
  build: {
    inlineStylesheets: 'always'
  },
  image: {
    service: passthroughImageService()
  },

  // EXPERIMENTAL (Speculation Rules API para precargas inteligentes instantáneas)
  experimental: {
    clientPrerender: true
  },

  // CONFIGURACIÓN DE VITE & BUNDLING
  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      esbuild: {
        drop: ['console', 'debugger'],
        legalComments: 'none'
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/app-check',
        'qrcode'
      ]
    }
  },

  // INTEGRACIONES: Sitemap automatizado y hook copy-sitemap estándar Workwii
  integrations: [
    sitemap({
      // 1. Excluir rutas privadas del sitemap público
      filter: (page) => !['/personal', '/cliente'].some(x => page.includes(x)),
      serialize(item) {
        // 2. Formato estándar ISO YYYY-MM-DD para lastmod
        item.lastmod = new Date().toISOString().split('T')[0];

        const p = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const check = (arr) => arr.some(x => p.includes(x));

        // 3. Prioridades graduadas por intención de búsqueda
        const [pri, freq] = (p === '/' || p === '/en') ? [1.0, 'daily']
          : check(['/productos', '/acerca', '/contacto', '/redes']) ? [0.8, 'weekly']
          : [0.6, 'monthly'];

        return Object.assign(item, { priority: pri, changefreq: freq });
      }
    }),
    {
      name: 'copy-sitemap',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const f = new URL('sitemap-0.xml', dir);
          const t = new URL('sitemap.xml', dir);
          if (fs.existsSync(f)) {
            fs.copyFileSync(f, t);
          }
        }
      }
    }
  ]
});

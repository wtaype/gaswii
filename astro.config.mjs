// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { linkweb, id } from './src/wii.js';

// https://astro.build/config
export default defineConfig({
  // CONFIGURACIÓN BASE (Dominio canónico y compresión extrema HTML)
  site: linkweb,
  base: '/',
  compressHTML: true,

  // NAVEGACIÓN RÁPIDA (Prefetch inteligente al hacer hover)
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: false
  },

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

  // CONFIGURACIÓN DE VITE & BUNDLING ESBUILD
  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
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
            if (id.includes('node_modules')) {
              return 'vendor';
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

  // INTEGRACIONES: Sitemap automatizado, modulepreload en caliente y minificación HTML extrema (Workwii)
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
    },
    {
      name: 'modulepreload-critical',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const distDir = fileURLToPath(dir);
          const astroDir = path.join(distDir, '_astro');
          if (!fs.existsSync(astroDir)) return;

          const criticalChunks = fs.readdirSync(astroDir).filter(f =>
            /^(widev|wii|sesion|vendor|vendor-firebase)\.[a-zA-Z0-9_-]+\.js$/.test(f)
          );
          if (!criticalChunks.length) return;

          const linkTags = criticalChunks
            .map(f => `  <link rel="modulepreload" href="/_astro/${f}" />`)
            .join('\n');

          const getHtml = (dirPath) => fs.readdirSync(dirPath, { withFileTypes: true })
            .flatMap(e => e.isDirectory()
              ? getHtml(path.join(dirPath, e.name))
              : e.name.endsWith('.html') ? [path.join(dirPath, e.name)] : []
            );

          for (const file of getHtml(distDir)) {
            const html = fs.readFileSync(file, 'utf-8');
            if (html.includes('modulepreload')) continue;
            const updated = html.replace('</head>', `${linkTags}\n</head>`);
            if (updated !== html) fs.writeFileSync(file, updated, 'utf-8');
          }
        }
      }
    },
    {
      name: 'minify-html-critical',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const distDir = fileURLToPath(dir);
          const getHtmlFiles = (dirPath) => fs.readdirSync(dirPath, { withFileTypes: true })
            .flatMap(e => e.isDirectory()
              ? getHtmlFiles(path.join(dirPath, e.name))
              : e.name.endsWith('.html') ? [path.join(dirPath, e.name)] : []
            );

          const minijs = (js) => js
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n')
            .map(l => l.replace(/(?:^|[^:])\/\/.*$/, '').trim())
            .filter(Boolean)
            .join(' ');

          const minihtml = (html) => html
            .replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (m, a, c) => a.includes('src=') ? m : `<script${a}>${minijs(c)}</script>`)
            .replace(/\n\s*/g, '')
            .replace(/>\s+</g, '><')
            .replace(/\s{2,}/g, ' ')
            .replace(/<!--.*?-->/g, '')
            .trim();

          for (const file of getHtmlFiles(distDir)) {
            fs.writeFileSync(file, minihtml(fs.readFileSync(file, 'utf-8')), 'utf-8');
          }
        }
      }
    }
  ]
});

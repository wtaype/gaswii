// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Compresión nativa de HTML para máxima velocidad y menor transferencia de red
  compressHTML: true,

  build: {
    // Inyección inteligente de hojas de estilo críticas (0ms FOUC)
    inlineStylesheets: 'auto'
  },

  vite: {
    // 1. Pre-optimización de dependencias pesadas (Previene el error 504 Outdated Optimize Dep)
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/app-check',
        'qrcode'
      ]
    },

    // 2. Ajustes de compilación, minificación y división de código (Code-Splitting)
    build: {
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Aislar el SDK de Firebase en su propio chunk en caché de navegador
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
          }
        }
      }
    }
  }
});

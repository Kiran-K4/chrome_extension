import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// ESM workaround to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/styles/*', dest: 'assets' },
        { src: 'public/manifest.json', dest: '.' },
        { src: 'public/icons/**/*', dest: 'icons' },
        { src: 'public/_locales/**/*', dest: '_locales' }, // i18n support
        { src: 'src/popup.html', dest: '.' }               // if not already copied
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        homePageBlur: resolve(__dirname, 'src/youtube/homePageBlur.ts'),
        floatingPopup: resolve(__dirname, 'src/intentionPopup.tsx'),
        linkedin: resolve(__dirname, 'src/linkedin/linkedin.ts') 
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});

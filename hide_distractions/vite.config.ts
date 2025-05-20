import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy' // ✅ added

// ESM workaround to get __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/styles/*', dest: 'assets' },          // ✅ copy CSS
        { src: 'public/icons', dest: 'icons' },           // ✅ copy icons
        { src: 'public/_locales', dest: '_locales' }    ,  // ✅ copy locale files
        { src: 'public/manifest.json', dest: '' } 
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        floatingPopup: resolve(__dirname, 'src/intentionPopup.tsx'),
        popup: resolve(__dirname, 'src/popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        homePageBlur: resolve(__dirname, 'src/homePageBlur.ts')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})

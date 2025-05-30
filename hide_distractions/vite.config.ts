import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// ESM workaround to get __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        floatingPopup: resolve(__dirname, 'src/intentionPopup.tsx'),
        popup: resolve(__dirname, 'src/popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        homePageBlur: resolve(__dirname, 'src/youtube/homePageBlur.ts')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
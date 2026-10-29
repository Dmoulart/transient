import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import transientAnalyzerPlugin from '@transient/vite-plugin-transient-analyzer'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    transientAnalyzerPlugin({
      tsConfigPath: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
      glob: fileURLToPath(new URL('./src/{samples,tests}/**/*.vue', import.meta.url)),
      dest: fileURLToPath(new URL('./src/assets/schemas', import.meta.url)),
    }),
    UnoCSS(),
    // samples and e2e fixtures only (assets/samples.css), the editor itself ships without it
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Editor',
      fileName: 'editor',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})

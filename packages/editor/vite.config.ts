import { fileURLToPath, resolve, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ui from '@nuxt/ui/vite'
import vueAnalyzerPlugin from './vite-plugin-vue-analyzer'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ui(),
    vueAnalyzerPlugin({
      tsConfigPath: fileURLToPath(new URL('./tsconfig.app.json', import.meta.url)),
      glob: fileURLToPath(new URL('./src/**/*.vue', import.meta.url)),
      dest: fileURLToPath(new URL('./src/assets/schemas', import.meta.url)),
    }),
  ],
  server: {
    watch: {
      ignored: ['!src/samples/**/*.vue'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

import { fileURLToPath, URL } from "node:url";
import ui from "@nuxt/ui/vite";
import transientAnalyzerPlugin from "@transient/vite-plugin-transient-analyzer";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ui(),
    transientAnalyzerPlugin({
      tsConfigPath: fileURLToPath(new URL("./tsconfig.app.json", import.meta.url)),
      glob: fileURLToPath(new URL("./src/{samples,tests}/**/*.vue", import.meta.url)),
      dest: fileURLToPath(new URL("./src/assets/schemas", import.meta.url)),
    }),
  ],
  server: {
    watch: {
      ignored: ["!src/samples/**/*.vue"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

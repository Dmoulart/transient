"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_url_1 = require("node:url");
var vite_1 = require("@nuxt/ui/vite");
var plugin_vue_1 = require("@vitejs/plugin-vue");
var vite_2 = require("vite");
var vite_plugin_vue_devtools_1 = require("vite-plugin-vue-devtools");
var vite_plugin_vue_analyzer_1 = require("./vite-plugin-vue-analyzer");
// https://vite.dev/config/
exports.default = (0, vite_2.defineConfig)({
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, vite_plugin_vue_devtools_1.default)(),
        (0, vite_1.default)(),
        (0, vite_plugin_vue_analyzer_1.default)({
            tsConfigPath: (0, node_url_1.fileURLToPath)(new node_url_1.URL('./tsconfig.app.json', import.meta.url)),
            glob: (0, node_url_1.fileURLToPath)(new node_url_1.URL('./src/{samples,tests}/**/*.vue', import.meta.url)),
            dest: (0, node_url_1.fileURLToPath)(new node_url_1.URL('./src/assets/schemas', import.meta.url)),
        }),
    ],
    server: {
        watch: {
            ignored: ['!src/samples/**/*.vue'],
        },
    },
    resolve: {
        alias: {
            '@': (0, node_url_1.fileURLToPath)(new node_url_1.URL('./src', import.meta.url)),
        },
    },
});

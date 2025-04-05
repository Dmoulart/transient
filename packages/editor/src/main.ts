import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import { GesturePlugin } from '@vueuse/gesture'

import App from './App.vue'
import router from './router'
import JsonViewer from 'vue3-json-viewer'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(JsonViewer)
app.use(ui)
app.use(GesturePlugin)

app.mount('#app')

import './assets/main.css'
import 'virtual:uno.css'
import ui from '@nuxt/ui/vue-plugin'
import { createApp } from 'vue'
import Playground from './Playground.vue'

const app = createApp(Playground)

app.use(ui)

app.mount('#app')

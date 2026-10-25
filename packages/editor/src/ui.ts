import './assets/main.css'
import 'virtual:uno.css'
import ui from '@nuxt/ui/vue-plugin'
import { createApp } from 'vue'
import Ui from './Ui.vue'

const app = createApp(Ui)

app.use(ui)

app.mount('#app')

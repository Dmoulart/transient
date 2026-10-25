import './assets/main.css'
import './assets/samples.css'
import 'virtual:uno.css'
import { createApp } from 'vue'
import Ui from './Ui.vue'

const app = createApp(Ui)

app.mount('#app')

import './assets/main.css'
import './assets/samples.css'
import 'virtual:uno.css'
import { createApp } from 'vue'
import Playground from './Playground.vue'

const app = createApp(Playground)

app.mount('#app')

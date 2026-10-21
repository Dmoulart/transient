import { createRouter, createWebHistory } from 'vue-router'
import ComponentEditor from '@/components/ComponentEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'component-editor',
      component: ComponentEditor,
    },
  ],
})

export default router

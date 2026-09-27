import ComponentEditor from '@/components/ComponentEditor.vue'
import { createRouter, createWebHistory } from 'vue-router'

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

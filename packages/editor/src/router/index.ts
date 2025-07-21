import { createRouter, createWebHistory } from 'vue-router'
import PageEditor from '@/components/PageEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'page-editor',
      component: PageEditor,
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import PageEditor from '@/components/PageEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Editor,
    },
    {
      path: '/edit',
      name: 'page',
      component: PageEditor,
    },
  ],
})

export default router

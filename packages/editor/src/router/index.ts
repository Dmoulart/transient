import { createRouter, createWebHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import PageEditor from '@/PageEditor/PageEditor.vue'
import { Edit } from 'lucide-vue-next'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'page-editor',
      component: PageEditor,
    },
    {
      path: '/component-editor',
      name: 'component-editor',
      component: Edit,
    },
  ],
})

export default router

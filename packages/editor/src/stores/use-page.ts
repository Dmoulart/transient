import { defineStore } from 'pinia'
import type { TransientComponentSchema } from 'transient'
import { ref } from 'vue'

export const usePage = defineStore('page', () => {
  const current = ref<TransientComponentSchema>()

  return { current }
})

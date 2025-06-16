import { defineStore } from 'pinia'
import type { TransientComponentDictionnary } from 'transient'
import { shallowRef } from 'vue'

export const useTransient = defineStore('transient', () => {
  const dictionnary = shallowRef<TransientComponentDictionnary>({})
  return { dictionnary }
})

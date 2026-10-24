import type { TransientComponentSchema } from '@transient/ir'
import type { Ref } from 'vue'

const STORAGE_KEY = 'page-schema'

export function useTemplate(schema: Ref<TransientComponentSchema>) {
  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema.value.template))
    console.log('Sauvegardé dans le localStorage.')
  }

  function loadFromLocalStorage() {
    const savedContents = localStorage.getItem(STORAGE_KEY)
    if (savedContents) {
      schema.value.template = JSON.parse(savedContents)
      console.log('Chargé depuis le localStorage.', schema.value.template)
    } else {
      console.log('Aucun élément dans le localStorage.')
    }
  }

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

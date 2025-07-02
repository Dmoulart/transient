import type { TransientTemplate } from 'transient/src/transient/definition'
import { ref } from 'vue'

const STORAGE_KEY = 'page-schema'

export function usePage(template: TransientTemplate) {
  const contents = ref<TransientTemplate>(template)

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents.value))
    console.log('Sauvegardé dans le localStorage.')
  }

  function loadFromLocalStorage() {
    const item = localStorage.getItem(STORAGE_KEY)
    if (item) {
      contents.value = JSON.parse(item)
      console.log('Chargé depuis le localStorage.')
    } else {
      console.log('Aucun élément dans le localStorage.')
    }
  }

  return {
    contents,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

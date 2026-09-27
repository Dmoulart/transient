import type { TransientTemplate } from 'transient'
import { ref } from 'vue'

const STORAGE_KEY = 'page-schema'

export function useTemplate(template: TransientTemplate) {
  const contents = ref<TransientTemplate>(template)

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents.value))
    console.log('Sauvegardé dans le localStorage.')
  }

  function loadFromLocalStorage() {
    const savedContents = localStorage.getItem(STORAGE_KEY)
    if (savedContents) {
      contents.value = JSON.parse(savedContents)
      console.log('Chargé depuis le localStorage.', contents.value)
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

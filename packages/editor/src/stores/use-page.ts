import { shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { registry } from '@/stores/use-dictionnary'
import type { TransientElement, TransientComponentSchema } from 'transient/src/transient/definition'
import { replaceElement } from 'transient/src/transient/ast'

const cloneSchema = (name: string) => ({
  ...registry[name],
})

const STORAGE_KEY = 'page-schema'

export function usePage(
  pageName = '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
) {
  // État de la page
  const page = shallowRef<TransientComponentSchema | undefined>(undefined)

  // État de la page modifiée
  const modifiedPage = shallowRef<TransientComponentSchema | undefined>(undefined)

  // Remplacer un élément
  function replace(newElement: TransientElement) {
    if (modifiedPage.value?.template?.elements) {
      replaceElement(modifiedPage.value.template.elements, newElement)
    }
  }

  // Sauvegarder dans le localStorage
  function saveToLocalStorage() {
    if (page.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(page.value))
      console.log('Sauvegardé dans le localStorage.')
    }
  }

  // Charger depuis le localStorage
  function loadFromLocalStorage() {
    const item = localStorage.getItem(STORAGE_KEY)
    if (item) {
      page.value = JSON.parse(item)
      console.log('Chargé depuis le localStorage.')
    } else {
      console.log('Aucun élément dans le localStorage.')
    }
  }

  // Synchroniser sur focusout
  function handleFocusOut(e: FocusEvent) {
    page.value = modifiedPage.value
    console.log('re-render!', page.value)
  }

  onMounted(() => {
    page.value = cloneSchema(pageName)
    modifiedPage.value = cloneSchema(pageName)

    document.addEventListener('focusout', handleFocusOut)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('focusout', handleFocusOut)
  })

  return {
    page,
    modifiedPage,
    replace,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

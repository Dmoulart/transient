import { shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { registry } from '@/stores/use-dictionnary'
import type { TransientElement, TransientComponentSchema } from 'transient/src/transient/definition'
import { appendElement, removeElement, replaceElement } from 'transient/src/transient/ast'

const cloneSchema = (name: string) => ({
  ...registry[name],
})

const STORAGE_KEY = 'page-schema'

export function usePage(
  pageName = '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
) {
  const page = shallowRef<TransientComponentSchema | undefined>(undefined)

  const modifiedPage = shallowRef<TransientComponentSchema | undefined>(undefined)

  function replace(newElement: TransientElement) {
    if (modifiedPage.value?.template?.elements) {
      replaceElement(newElement, modifiedPage.value.template.elements)
    }
  }

  function remove(id: string) {
    if (modifiedPage.value?.template?.elements) {
      removeElement(id, modifiedPage.value.template.elements)
    }
  }

  function append(parentId: string, newElement: TransientElement) {
    if (modifiedPage.value?.template?.elements) {
      appendElement(newElement, parentId, modifiedPage.value.template.elements)
    }
  }

  function saveToLocalStorage() {
    if (page.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(page.value))
      console.log('Sauvegardé dans le localStorage.')
    }
  }

  function loadFromLocalStorage() {
    const item = localStorage.getItem(STORAGE_KEY)
    if (item) {
      page.value = JSON.parse(item)
      console.log('Chargé depuis le localStorage.')
    } else {
      console.log('Aucun élément dans le localStorage.')
    }
  }

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
    remove,
    append,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

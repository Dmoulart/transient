import { shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { registry } from '@/stores/use-dictionnary'
import type { TransientElement, TransientComponentSchema } from 'transient/src/transient/definition'
import {
  appendElement,
  findElementById,
  patchElement,
  removeElement,
  replaceElement,
} from 'transient/src/transient/ast'

const cloneSchema = (name: string) => ({
  ...registry[name],
})

const STORAGE_KEY = 'page-schema'

export function usePage(
  pageName = '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
) {
  const page = shallowRef<TransientComponentSchema>(cloneSchema(pageName))

  const modifiedPage = shallowRef<TransientComponentSchema>(cloneSchema(pageName))

  function replace(newElement: TransientElement) {
    replaceElement(newElement, modifiedPage.value.template!.elements)
  }

  function remove(id: string) {
    if (modifiedPage.value?.template?.elements) {
      removeElement(id, modifiedPage.value.template!.elements)
    }
  }

  function patch(element: TransientElement) {
    const oldElement = findElementById(modifiedPage.value.template!.elements!, element.id)!
    patchElement(element, oldElement)
  }

  function append(parentId: string, newElement: TransientElement) {
    appendElement(newElement, parentId, modifiedPage.value.template!.elements)
  }

  function find(id: string) {
    return findElementById(modifiedPage.value.template!.elements!, id)
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(page.value))
    console.log('Sauvegardé dans le localStorage.')
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

  function render() {
    page.value = modifiedPage.value
  }

  return {
    page,
    modifiedPage,
    replace,
    find,
    render,
    remove,
    patch,
    append,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

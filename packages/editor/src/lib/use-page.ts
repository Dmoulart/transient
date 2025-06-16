import { ref, shallowRef } from 'vue'
import type { TransientElement, TransientTemplate } from 'transient/src/transient/definition'
import {
  appendElement,
  findElementById,
  patchElement,
  removeElement,
  replaceElement,
} from 'transient/src/transient/ast'

const STORAGE_KEY = 'page-schema'

export function usePage(template: TransientTemplate) {
  const page = ref<TransientTemplate>(template)

  const modifiedPage = shallowRef<TransientTemplate>(template)

  function replace(newElement: TransientElement) {
    const replaced = replaceElement(newElement, template.elements)

    if (!replaced) {
      console.log('cannot replace')
    }
  }

  function remove(id: string) {
    removeElement(id, modifiedPage.value.elements)
  }

  function patch(element: TransientElement) {
    const oldElement = findElementById(modifiedPage.value.elements!, element.id)!
    patchElement(element, oldElement)
  }

  function append(parentId: string, newElement: TransientElement) {
    appendElement(newElement, parentId, modifiedPage.value.elements)
  }

  function find(id: string) {
    return findElementById(modifiedPage.value.elements!, id)
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

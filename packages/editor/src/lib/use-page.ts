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
  const contents = ref<TransientTemplate>(template)

  const modifiedContents = shallowRef<TransientTemplate>(template)

  function replace(newElement: TransientElement) {
    const replaced = replaceElement(newElement, template.elements)

    if (!replaced) {
      console.log('cannot replace')
    }
  }

  function remove(id: string) {
    removeElement(id, modifiedContents.value.elements)
  }

  function patch(element: TransientElement) {
    const oldElement = findElementById(modifiedContents.value.elements!, element.id)!
    patchElement(element, oldElement)
  }

  function append(parentId: string, newElement: TransientElement) {
    appendElement(newElement, parentId, modifiedContents.value.elements)
  }

  function find(id: string) {
    return findElementById(modifiedContents.value.elements!, id)
  }

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

  function render() {
    contents.value = modifiedContents.value
  }

  return {
    contents,
    modifiedContents,
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

import { ref, shallowRef } from 'vue'
import type { TransientElement, TransientTemplate } from 'transient/src/transient/definition'
import {
  appendElement,
  findElementById,
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElement,
} from 'transient/src/transient/ast'
import { updatedDiff } from 'deep-object-diff'

const STORAGE_KEY = 'page-schema'

export function usePage(template: TransientTemplate) {
  const contents = ref<TransientTemplate>(template)

  const modifiedContents = ref<TransientTemplate>(template)

  function replace(newElement: TransientElement) {
    const replaced = replaceElement(newElement, contents.value.elements)

    if (!replaced) {
      console.log('cannot replace')
    }
  }

  function remove(id: string) {
    removeElement(id, modifiedContents.value.elements)
  }

  function append(parentId: string, newElement: TransientElement) {
    appendElement(newElement, parentId, modifiedContents.value.elements)
  }

  function find(id: string) {
    return findElementById(modifiedContents.value.elements!, id)
  }

  function insertAfter(id: string, newElement: TransientElement) {
    return insertAfterElement(newElement, id, modifiedContents.value.elements)
  }

  function insertBefore(id: string, newElement: TransientElement) {
    return insertBeforeElement(newElement, id, modifiedContents.value.elements)
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
    append,
    insertAfter,
    insertBefore,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}

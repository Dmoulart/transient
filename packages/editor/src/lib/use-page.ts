import { ref, shallowRef, triggerRef } from 'vue'
import type { TransientElement, TransientTemplate } from 'transient/src/transient/definition'
import {
  appendElement,
  findElementById,
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElement,
  replaceElementSlot,
} from 'transient/src/transient/ast'
import { updatedDiff } from 'deep-object-diff'

const STORAGE_KEY = 'page-schema'

export function usePage(template: TransientTemplate) {
  const contents = ref<TransientTemplate>(template)

  function replace(newElement: TransientElement) {
    const replaced = replaceElement(newElement, contents.value.elements)

    if (!replaced) {
      console.log('cannot replace')
    }
  }

  function remove(id: string) {
    removeElement(id, contents.value.elements)
  }

  function replaceSlot(content: TransientElement[], id: string, slot: string) {
    replaceElementSlot(content, id, slot, contents.value.elements)
  }

  function append(parentId: string, newElement: TransientElement) {
    appendElement(newElement, parentId, contents.value.elements)
  }

  function find(id: string) {
    return findElementById(contents.value.elements!, id)
  }

  function insertAfter(id: string, newElement: TransientElement) {
    return insertAfterElement(newElement, id, contents.value.elements)
  }

  function insertBefore(id: string, newElement: TransientElement) {
    return insertBeforeElement(newElement, id, contents.value.elements)
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
    triggerRef(contents)
  }

  return {
    contents,
    replace,
    find,
    render,
    remove,
    append,
    insertAfter,
    insertBefore,
    saveToLocalStorage,
    loadFromLocalStorage,
    replaceSlot,
  }
}

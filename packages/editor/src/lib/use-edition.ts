
import { useEventBus, useEventListener, useFavicon, watchDebounced, whenever } from '@vueuse/core'
import { getTransientID, htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'
import type { TransientElement } from 'transient/src/transient/definition'
import { computed, createApp, ref, watch, type App } from 'vue'

const editedNode = ref<Node | undefined>()



useEventListener('focusin', (e) => {
  const element = e.target
  if (element instanceof HTMLElement) {
    const id = getTransientID(element)
    if (id) {
      editedNode.value = element
    }
  }
})

useEventListener('focusout', (e) => {
  console.log({ ...editedNode })
  editedNode.value = undefined
})

export function useEditedNode() {
  return editedNode
}

const editedTransientElement = computed(() => {
  if (editedNode.value) {
    return htmlNodeToTransientElement(
      editedNode.value,
      getTransientID(editedNode.value) ?? crypto.randomUUID(),
    )
  }

  return undefined
})

export function useEditedTransientElement() {
  return editedTransientElement
}

type OnEditCallback = (element: TransientElement) => void

export function useEdition() {
  const cbs = {
    onEditStart: [] as OnEditCallback[],
    onEditEnd: [] as OnEditCallback[],
  }

  watch(editedNode, (newNode, oldNode) => {
    if (newNode !== undefined) {
      const newElement = htmlNodeToTransientElement(newNode, getTransientID(newNode)!)
      cbs.onEditStart.forEach((cb) => cb(newElement))
    }

    if (oldNode !== undefined) {
      const newElement = htmlNodeToTransientElement(oldNode, getTransientID(oldNode)!)
      cbs.onEditEnd.forEach((cb) => cb(newElement))
    }
  })

  return {
    onEditStart(cb: OnEditCallback) {
      cbs.onEditStart.push(cb)
    },
    onEditEnd(cb: OnEditCallback) {
      cbs.onEditEnd.push(cb)
    },
  }
}

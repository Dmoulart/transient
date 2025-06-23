import { useEventBus, useEventListener, useFavicon, watchDebounced, whenever } from '@vueuse/core'
import { getTransientID, htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'
import { hasTextChildren } from 'transient/src/transient/ast'
import type { TransientElement } from 'transient/src/transient/definition'
import { computed, createApp, readonly, ref, watch, type App } from 'vue'

const editedNode = ref<HTMLElement | undefined>()

export function isElementEditable(element: TransientElement) {
  return !!element.slots //hasTextChildren(element)
}

export function isNodeEditable(node: HTMLElement) {
  return node.dataset.transientEditable
}

export function detectElementEdition(e: Event) {
  const element = e.target
  if (element instanceof HTMLElement) {
    if (isNodeEditable(element)) {
      editedNode.value = element
    }
  }
}
useEventListener(document, 'focusin', detectElementEdition)

useEventListener(document, 'focusout', (e) => {
  console.log({ ...editedNode })
  editedNode.value = undefined
})

export function useEditedNode() {
  return editedNode
}

export function useEditedNodeBoundingBox() {
  return computed(() => {
    if (editedNode.value) {
      const rect = editedNode.value.getBoundingClientRect()
      console.log({ rect })
      return {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      }
    }
    return undefined
  })
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

// export function useLastEditedTransientElement() {
//   const lastEditedTransientElement = ref<TransientElement | undefined>(editedTransientElement.value)

//   watch(editedTransientElement, (newElement, oldElement) => {
//     if (newElement) {
//       lastEditedTransientElement.value = editedTransientElement.value
//       console.log('lastEditedTransientElement updated', newElement)
//     }
//   })

//   return lastEditedTransientElement.value
// }

type OnEditCallback = (element: TransientElement, node: Node) => void

export function useEdition() {
  const cbs = {
    onEditStart: [] as OnEditCallback[],
    onEditEnd: [] as OnEditCallback[],
  }

  watch(editedNode, (newNode, oldNode) => {
    if (newNode !== undefined) {
      const newElement = htmlNodeToTransientElement(newNode, getTransientID(newNode)!)
      cbs.onEditStart.forEach((cb) => cb(newElement, newNode))
    }

    if (oldNode !== undefined) {
      const newElement = htmlNodeToTransientElement(oldNode, getTransientID(oldNode)!)
      cbs.onEditEnd.forEach((cb) => cb(newElement, oldNode))
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

const componentPanelIsOpen = ref(false)
const targetNodeID = ref<string | undefined>(undefined)

export function useComponentPanel() {
  return {
    targetNodeID: targetNodeID,
    isOpen: readonly(componentPanelIsOpen),
    toggle() {
      componentPanelIsOpen.value = !componentPanelIsOpen.value
    },
    open() {
      componentPanelIsOpen.value = true
    },
    close() {
      componentPanelIsOpen.value = false
    },
  }
}

import { useEventListener } from '@vueuse/core'
import { DiffDOM } from 'diff-dom'
import { getTransientID, htmlNodeToTransientElement } from 'transient/src/analyzers/html/html'
import type { TransientElement } from 'transient/src/transient/definition'
import { computed, readonly, ref, watch, type App } from 'vue'

const editedNode = ref<HTMLElement | undefined>()

export function isElementEditable(element: TransientElement) {
  return true
}

export function isNodeEditable(node: HTMLElement) {
  return node.dataset.transientId || node.dataset.transientSlot
}

export function detectElementEdition(e: Event) {
  const element = e.target
  if (element instanceof HTMLElement) {
    if (isNodeEditable(element)) {
      console.log('focusin', e.target)
      editedNode.value = element
      // const tid = element.closest(`[contenteditable="true"`)
      // console.log({ tid })
    }
  }
}

useEventListener(document, 'focusin', detectElementEdition)

// useEventListener(document, 'click', (e) => {
//   const element = e.target
//   if (element instanceof HTMLElement) {
//     // element.tabIndex = 0
//     // element.focus()
//     // if (isNodeEditable(element)) {
//     //   editedNode.value = element
//     // }
//   }
// })

useEventListener(document, 'focusout', (e) => {
  console.log('focusout', e.target)
  editedNode.value = undefined
})

export function useEditedNode() {
  return editedNode
}

export function useEditedNodeBoundingBox() {
  return computed(() => {
    if (editedNode.value) {
      const rect = editedNode.value.getBoundingClientRect()
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

type OnEditCallback = (element: TransientElement, node: Node) => void

const dd = new DiffDOM()

export function useEdition() {
  const cbs = {
    onEditStart: [] as OnEditCallback[],
    onEditEnd: [] as OnEditCallback[],
  }

  let nodeBeforeEdition: HTMLElement | undefined = undefined

  watch(editedNode, (newNode, oldNode) => {
    if (newNode !== undefined) {
      const newElement = htmlNodeToTransientElement(
        newNode,
        getTransientID(newNode) ?? crypto.randomUUID(),
      )
      cbs.onEditStart.forEach((cb) => cb(newElement, newNode))
      // nodeBeforeEdition = newNode.cloneNode(true) as HTMLElement
    }

    if (oldNode !== undefined) {
      const newElement = htmlNodeToTransientElement(
        oldNode,
        getTransientID(oldNode) ?? crypto.randomUUID(),
      )
      cbs.onEditEnd.forEach((cb) => cb(newElement, oldNode))
      // if (nodeBeforeEdition) {
      //   const diff = dd.diff(nodeBeforeEdition, oldNode)
      //   console.log({ diff }, { oldNode })
      // }
      // nodeBeforeEdition = undefined
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

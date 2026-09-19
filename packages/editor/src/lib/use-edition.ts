import type { TransientComponentSchema, TransientElement, TransientTemplate } from 'transient'
import { computed, readonly, ref, watch, type Ref } from 'vue'
import { useDictionnary } from './use-dictionnary'
import { assertIsDefined, findElementById, getTransientID } from 'transient'

const editedNode = ref<HTMLElement | undefined>()

export function isElementEditable(element: TransientElement) {
  return true
}

export function isNodeEditable(node: HTMLElement) {
  return node.dataset.transientId || node.dataset.transientSlot
}

export function useEditedNode() {
  return editedNode
}

export function useEditedNodeSchema() {
  return computed(() => {
    if (editedNode.value) {
      if (editedNode.value.dataset.transientComponent) {
        return useDictionnary().get(editedNode.value.dataset.transientComponent)
      }
    }
  })
}

export function useEditedNodeElement(template: Ref<TransientTemplate>) {
  const node = useEditedNode()
  return computed(() => {
    if (node.value) {
      if (node.value.dataset.transientId) {
        const transientId = getTransientID(node.value)

        if (transientId) {
          return findElementById(template.value.elements, transientId)
        }
      }
    }
    return undefined
  })
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

type OnEditCallback = (node: Node) => void

export function useEdition() {
  const cbs = {
    onEditStart: [] as OnEditCallback[],
    onEditEnd: [] as OnEditCallback[],
  }

  watch(editedNode, (newNode, oldNode) => {
    if (newNode !== undefined) {
      cbs.onEditStart.forEach((cb) => cb(newNode))
    }

    if (oldNode !== undefined) {
      cbs.onEditEnd.forEach((cb) => cb(oldNode))
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

type OnCloseCb = (componentSchema: TransientComponentSchema) => void

export function useComponentPanel() {
  const onSelect = ref<OnCloseCb>()
  return {
    isOpen: readonly(componentPanelIsOpen),
    onSelect,
    close() {
      componentPanelIsOpen.value = false
    },
    toggle() {
      componentPanelIsOpen.value = !componentPanelIsOpen.value
    },
    open(onSelectCb: OnCloseCb) {
      onSelect.value = onSelectCb
      componentPanelIsOpen.value = true
    },
    select(componentSchema: TransientComponentSchema) {
      assertIsDefined(onSelect.value)
      onSelect.value(componentSchema)
    },
  }
}

export function isSidebarOpen() {
  return computed(() => useEditedNodeSchema().value)
}

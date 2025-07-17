import { useEventListener } from '@vueuse/core'
import { DiffDOM } from 'diff-dom'
import { getTransientID, htmlElementToTransientElement } from 'transient/src/analyzers/html/html'
import { assertIsDefined } from 'transient/src/core/assert'
import type { TransientComponentSchema, TransientElement } from 'transient/src/transient/definition'
import { computed, readonly, ref, watch, type App } from 'vue'
import { useDictionnary } from './use-dictionnary'
import { findElementById, getComponentDefaultPropsValues } from 'transient/src/transient/ast'

const editedNode = ref<HTMLElement | undefined>()

export function isElementEditable(element: TransientElement) {
  return true
}

export function isNodeEditable(node: HTMLElement) {
  return node.dataset.transientId || node.dataset.transientSlot
}

// export function detectElementEdition(e: Event) {
//   const element = e.target
//   if (element instanceof HTMLElement) {
//     if (isNodeEditable(element)) {
//       editedNode.value = element
//       // const tid = element.closest(`[contenteditable="true"`)
//       // console.log({ tid })
//     }
//   }
// }

// useEventListener(document, 'focusin', detectElementEdition)

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

// useEventListener(document, 'focusout', (e) => {
//   editedNode.value = undefined
// })

export function useEditedNode() {
  return editedNode
}

export function useEditedNodeSchema() {
  return computed(() => {
    if (editedNode.value) {
      console.log({ editedNode })
      if (editedNode.value.dataset.transientComponent) {
        return useDictionnary().get(editedNode.value.dataset.transientComponent)
      }
    }
  })
}

export function useEditedNodeElement(elements: TransientElement[]) {
  const node = useEditedNode()
  return computed(() => {
    if (node.value) {
      if (node.value.dataset.transientId) {
        const transientId = getTransientID(node.value)
        if (transientId) {
          return findElementById(elements, transientId)
        }
      }
    }
  })
}

export function useEditedNodeElementProps(elements: TransientElement[]) {
  const element = useEditedNodeElement(elements)
  const schema = useEditedNodeSchema()
  return computed({
    get() {
      if (element.value && schema.value) {
        return {
          ...getComponentDefaultPropsValues(schema.value.props),
          ...(element.value?.attributes || {}),
        }
      }
      return {}
    },
    set(value: Record<string, any>) {
      const wrapped: Record<string, any> = {}

      for (const [key, val] of Object.entries(value)) {
        if (
          typeof val === 'object' &&
          val !== null &&
          'type' in val &&
          val.type === 'literal' &&
          'expression' in val
        ) {
          wrapped[key] = val // already wrapped
        } else {
          wrapped[key] = { type: 'literal', expression: val }
        }
      }

      console.log({ value: wrapped })

      if (element.value) {
        element.value.attributes ??= {}
        element.value.attributes = wrapped
      }
    },
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

const dd = new DiffDOM()

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

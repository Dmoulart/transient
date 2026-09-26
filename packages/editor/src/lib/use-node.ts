import type { TransientComponentSchema, TransientElement, TransientTemplate } from 'transient'
import { computed, readonly, ref, type ComputedRef, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { assertIsDefined, findElementById, getElementProps, getTransientID } from 'transient'
import { useElementBounding, useMutationObserver } from '@vueuse/core'

export function useNode(
  node: Ref<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const editable = computed(() => {
    return node.value && (node.value.dataset.transientId || node.value.dataset.transientSlot)
  })

  const schema = computed(() => {
    if (node.value?.dataset?.transientComponent) {
      return dictionnary.get(node.value.dataset.transientComponent)
    }
    return null
  })

  const element = computed(() => {
    if (!node.value) {
      return null
    }
    return getElementFromNode(node.value, template.value.elements)
  })

  const isSlot = computed(() => {
    return node.value && node.value.dataset.transientSlot
  })

  const isEditableText = computed(() => {
    return node.value && node.value.contentEditable === 'true'
  })

  const slotsNodes = computed(() => {
    if (!node.value) {
      return null
    }
    const id = getNodeId(node.value)
    if (!id) {
      return null
    }

    // if node is it's own slot
    if (isNodeASlotOf(id, node.value)) return [node.value]

    return node.value.querySelectorAll<HTMLElement>(`[data-transient-slot$='${id}']`)
  })

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  return { node, element, editable, isSlot, isEditableText, schema, props, slotsNodes }
}

export function useParentComponent(
  node: ComputedRef<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const parentComponent = computed<HTMLElement | null>(
    () => node.value?.closest('[data-transient-component]') ?? null,
  )

  return useNode(parentComponent, template, dictionnary)
}

export function getNodeId(node: HTMLElement) {
  return node.dataset.transientId
}

export function getNodeComponentTagName(node: HTMLElement) {
  return node.dataset.transientComponent
}

export function getSlotId(node: HTMLElement) {
  return node.dataset.transientSlot
}

function isNodeComponent(node: HTMLElement) {
  return Boolean(getNodeComponentTagName(node))
}

export function isNodeEditable(node: HTMLElement) {
  return Boolean(node.dataset.transientId || node.dataset.transientSlot)
}

export function getSlotOwnerId(node: HTMLElement) {
  const slotId = getSlotId(node)
  if (!slotId) {
    return null
  }
  const [_, ownerId] = slotId.split(':') as [string, string]
  return ownerId
}

export function isNodeASlotOf(ownerTransientId: string, node: HTMLElement) {
  const slotOwnerId = getSlotOwnerId(node)
  if (!slotOwnerId) return false
  return slotOwnerId === ownerTransientId
}

// function isNodeEditable(node: HTMLElement) {
//   return Boolean(node.dataset.transientEditable === 'true')
// }

export function getElementFromNode(node: HTMLElement, elements: TransientElement[]) {
  if (getNodeId(node)) {
    const transientId = getTransientID(node)

    if (transientId) {
      return findElementById(elements, transientId)
    }
  }

  return null
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

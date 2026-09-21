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

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  return { node, element, editable, isSlot, isEditableText, schema, props }
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

function isNodeComponent(node: HTMLElement) {
  return Boolean(node.dataset.transientComponent)
}

export function isNodeEditable(node: HTMLElement) {
  return Boolean(node.dataset.transientId || node.dataset.transientSlot)
}

// function isNodeEditable(node: HTMLElement) {
//   return Boolean(node.dataset.transientEditable === 'true')
// }

export function getNodeId(node: HTMLElement) {
  return node.dataset.transientId
}

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

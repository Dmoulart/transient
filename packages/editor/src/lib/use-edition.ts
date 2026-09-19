import type { TransientComponentSchema, TransientTemplate } from 'transient'
import { computed, readonly, ref, shallowRef, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { assertIsDefined, findElementById, getElementProps, getTransientID } from 'transient'

export function useNode(template: Ref<TransientTemplate>, dictionnary: ComponentDictionnary) {
  const node = shallowRef<HTMLElement | null>(null)

  const editable = computed(() => {
    return node.value && (node.value.dataset.transientId || node.value.dataset.transientSlot)
  })

  const schema = computed(() => {
    if (node.value?.dataset?.transientComponent) {
      return dictionnary.get(node.value.dataset.transientComponent)
    }
    return null
  })

  const bbox = computed(() => {
    if (node.value) {
      const rect = node.value.getBoundingClientRect()
      return {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      }
    }
    return null
  })

  const element = computed(() => {
    if (node.value?.dataset?.transientId) {
      const transientId = getTransientID(node.value)

      if (transientId) {
        return findElementById(template.value.elements, transientId)
      }
    }

    return null
  })

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  return { node, element, editable, schema, bbox, props }
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

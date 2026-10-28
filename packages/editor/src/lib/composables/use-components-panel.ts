import { assertDefined } from '@transient/core'
import type { TransientComponentSchema } from '@transient/ir'
import { readonly, ref } from 'vue'

type OnCloseCb = (componentSchema: TransientComponentSchema) => void

// Module-level so every caller shares the same panel state.
const componentPanelIsOpen = ref(false)
const onSelect = ref<OnCloseCb>()

export function useComponentPanel() {
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
      assertDefined(onSelect.value)
      onSelect.value(componentSchema)
    },
  }
}

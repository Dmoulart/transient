import { type TransientComponentSchema, assertIsDefined } from 'transient'
import { ref, readonly } from 'vue'

type OnCloseCb = (componentSchema: TransientComponentSchema) => void

export function useComponentPanel() {
  const componentPanelIsOpen = ref(false)

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

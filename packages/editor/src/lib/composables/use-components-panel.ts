import { assertDefined } from "@transient/core"
import { type TransientComponentSchema } from "@transient/ir"
import { readonly, ref } from "vue";

type OnCloseCb = (componentSchema: TransientComponentSchema) => void;

export function useComponentPanel() {
  const componentPanelIsOpen = ref(false);

  const onSelect = ref<OnCloseCb>();
  return {
    isOpen: readonly(componentPanelIsOpen),
    onSelect,
    close() {
      componentPanelIsOpen.value = false;
    },
    toggle() {
      componentPanelIsOpen.value = !componentPanelIsOpen.value;
    },
    open(onSelectCb: OnCloseCb) {
      onSelect.value = onSelectCb;
      componentPanelIsOpen.value = true;
    },
    select(componentSchema: TransientComponentSchema) {
      assertDefined(onSelect.value);
      onSelect.value(componentSchema);
    },
  };
}

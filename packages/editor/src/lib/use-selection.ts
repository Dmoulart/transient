import { type TransientTemplate } from 'transient'
import { computed, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { useNode, useParentComponent } from './use-node'

export function useSelection(
  selectedNode: Ref<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const selected = useNode(selectedNode, template, dictionnary)

  const component = useParentComponent(
    computed(() => {
      return selected.node.value
    }),
    template,
    dictionnary,
  )

  const slot = useNode(
    computed(() => (selected.isSlot ? selected.node.value : null)),
    template,
    dictionnary,
  )

  const text = useNode(
    computed(() => (selected.isEditableText ? selected.node.value : null)),
    template,
    dictionnary,
  )

  return { selected, component, slot, text }
}

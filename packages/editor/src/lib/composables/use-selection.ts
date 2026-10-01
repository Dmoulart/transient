import { type TransientTemplate } from 'transient'
import { computed, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { useNode } from './use-node'
import { useClosestComponent } from './use-closest-component'
import type { Index } from './use-index'
import { useEditableText } from './use-editable-text'

export function useSelection(
  selectedNode: Ref<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
  index: Index,
) {
  const selected = useNode(selectedNode, template)

  const component = useClosestComponent(
    computed(() => {
      return selected.node.value
    }),
    template,
    dictionnary,
    index,
  )

  const text = useEditableText(
    computed(() => {
      return selected.node.value
    }),
    template,
    dictionnary,
    index,
  )

  return { selected, component, text }
}

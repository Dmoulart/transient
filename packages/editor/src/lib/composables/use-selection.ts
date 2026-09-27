import { type TransientTemplate } from 'transient'
import { computed, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { useNode } from './use-node'
import { useClosestComponent } from './use-closest-component'

export function useSelection(
  selectedNode: Ref<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const selected = useNode(selectedNode, template)

  const component = useClosestComponent(
    computed(() => {
      return selected.node.value
    }),
    template,
    dictionnary,
  )

  return { selected, component }
}

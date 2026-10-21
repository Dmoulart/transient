import type { TransientTemplate } from 'transient'
import { type ComputedRef, computed, type Ref } from 'vue'
import type { useClosestComponent } from './use-closest-component'
import type { ComponentDictionnary } from './use-dictionnary'
import { useId } from './use-id'
import type { Index } from './use-index'

export function useEditableText(
  maybeNode: ComputedRef<HTMLElement | null>,
  _component: ReturnType<typeof useClosestComponent>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
  index: Index,
) {
  const nodeId = computed(() => (maybeNode.value && index.nodeId(maybeNode.value)) ?? null)

  const tid = useId(nodeId, template, dictionnary, index)

  const id = computed(() => tid.id.value)

  const editable = computed(() => {
    return !tid.element.value?.isComponent
  })

  const container = computed(() => {
    if (maybeNode.value && editable.value) {
      return maybeNode.value
    }
    return null
  })

  return {
    id,
    editable,
    container,
  }
}

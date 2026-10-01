import type { TransientTemplate } from 'transient'
import { computed, watch, type ComputedRef, type Ref } from 'vue'
import type { ComponentDictionnary } from './use-dictionnary'
import type { Index } from './use-index'
import { useId } from './use-id'
import { whenever } from '@vueuse/core'

export function useEditableText(
  maybeNode: ComputedRef<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
  index: Index,
) {
  const nodeId = computed(() => (maybeNode.value && index.nodeId(maybeNode.value)) ?? null)

  const id = useId(nodeId, template, dictionnary, index)

  const editable = computed(() => {
    return !id.element.value?.isComponent
  })

  const container = computed(() => {
    if (maybeNode.value && editable.value) {
      return maybeNode.value
    }
    return null
  })

  whenever(container, (newContainer) => {
    newContainer.contentEditable = 'true'
    newContainer.focus()

    watch(
      container,
      () => {
        newContainer.contentEditable = 'false'
      },
      { once: true },
    )
  })

  return {
    editable,
    container,
  }
}

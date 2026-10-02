import { type TransientTemplate } from 'transient'
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ComponentDictionnary } from './use-dictionnary'
import type { Index } from './use-index'
import { useId } from './use-id'

export function useEditableText(
  maybeNode: ComputedRef<HTMLElement | null>,
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

  //   whenever(container, (newContainer) => {
  //     newContainer.contentEditable = 'true'
  //     newContainer.focus()
  //     const stop = useEventListener(newContainer, 'focusout', (event) => {
  //       if (event.target) {
  //         htmlElementToTransientElement(event.target, id.id.value)
  //       }
  //     })

  //     watch(
  //       container,
  //       () => {
  //         stop()
  //         newContainer.contentEditable = 'false'
  //       },
  //       { once: true },
  //     )
  //   })

  return {
    id,
    editable,
    container,
  }
}

import type { TransientTemplate } from '@transient/ir'
import { type ComputedRef, computed, type Ref } from 'vue'
import type { ComponentDictionnary } from './use-dictionnary'
import { useId } from './use-id'
import type { Index } from './use-index'

export function useClosestComponent(
  node: ComputedRef<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
  index: Index,
) {
  const id = computed(() => node.value && index.closestComponentId(node.value))

  return useId(id, template, dictionnary, index)
}

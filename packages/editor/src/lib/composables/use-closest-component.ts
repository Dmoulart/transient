import type { TransientTemplate } from 'transient'
import { type ComputedRef, type Ref, computed } from 'vue'
import { findAncestorIrTag } from '../ir/dom'
import type { ComponentDictionnary } from './use-dictionnary'
import { useIrTag } from './use-ir-tag'

export function useClosestComponent(
  node: ComputedRef<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const componentTag = computed<Node | null>(() => node.value && findAncestorIrTag(node.value))

  return useIrTag(componentTag, template, dictionnary)
}

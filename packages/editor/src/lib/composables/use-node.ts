import type { TransientTemplate } from 'transient'
import { type Ref } from 'vue'

export function useNode(node: Ref<HTMLElement | null>, template: Ref<TransientTemplate>) {
  return { node }
}

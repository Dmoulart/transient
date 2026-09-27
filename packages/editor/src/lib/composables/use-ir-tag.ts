import {
  type TransientTemplate,
  assertIsDefined,
  findElementById,
  getElementProps,
} from 'transient'
import { computed, type Ref } from 'vue'
import { parseOpenIrTag, getIrTagChildrenElements, traverseIrTree } from '../ir/dom'
import type { ComponentDictionnary } from './use-dictionnary'
import { getSlotName } from './use-node'

export function useIrTag(
  tag: Ref<Node | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const ir = computed(() => {
    return tag.value && parseOpenIrTag(tag.value)
  })

  const id = computed(() => {
    return ir.value?.key
  })

  const schema = computed(() => {
    if (ir.value?.type === 'component') {
      assertIsDefined(ir.value.name)
      return dictionnary.get(ir.value.name)
    }

    return null
  })

  const element = computed(() => {
    if (!ir.value) {
      return null
    }
    return findElementById(template.value.elements, ir.value.key)
  })

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  const root = computed<HTMLElement[] | null>(() => {
    if (tag.value && ir.value?.type === 'component') {
      return getIrTagChildrenElements(tag.value)
    }
    return null
  })

  const slots = computed<Record<string, Node[]> | null>(() => {
    if (tag.value && ir.value?.type === 'component') {
      const slots: Record<string, Node[]> = {}

      traverseIrTree(tag.value, (ir, elements) => {
        if (ir.type === 'slot' && ir.key === id.value) {
          const slotName = getSlotName(ir)
          slots[slotName] = elements
        }
      })

      return Object.keys(slots).length > 0 ? slots : null
    }

    return null
  })

  return { id, ir, tag, element, schema, props, root, slots }
}

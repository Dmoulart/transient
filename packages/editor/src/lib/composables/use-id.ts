import {
  type TransientTemplate,
  assertIsDefined,
  findElementById,
  getElementProps,
} from 'transient'
import { computed, type Ref } from 'vue'
import type { ComponentDictionnary } from './use-dictionnary'
import type { Index } from './use-index'

export function useId(
  id: Ref<string | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
  index: Index,
) {
  const element = computed(() => {
    if (!id.value) {
      return null
    }
    return findElementById(template.value.elements, id.value)
  })

  const schema = computed(() => {
    if (element.value?.isComponent) {
      assertIsDefined(element.value.tag)
      return dictionnary.get(element.value.tag)
    }

    return null
  })

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  const root = computed<Node[] | null>(() => {
    if (element.value?.isComponent) {
      return index.rootNodes(id.value!)
    }
    return null
  })

  const slots = computed(() => {
    if (element.value?.isComponent) {
      const slots = index.slots(id.value!)
      return slots.length > 0 ? slots : null
    }

    return null
  })

  return { id, tag: id, element, schema, props, root, slots }
}

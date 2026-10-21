import {
  assertIsDefined,
  findElementById,
  getElementProps,
  type TransientTemplate,
} from 'transient'
import { computed, type Ref } from 'vue'
import type { ComponentDictionnary } from './use-dictionnary'

export function useElement(
  id: Ref<string | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
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

  return { id, element, schema, props }
}

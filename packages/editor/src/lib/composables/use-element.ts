import { assertDefined } from '@transient/core'
import {
  findElementById,
  getElementProps,
  type TransientComponentDictionnary,
  type TransientComponentSchema,
} from '@transient/ir'
import { computed, type Ref } from 'vue'

export function useElement(
  id: Ref<string | null>,
  component: Ref<TransientComponentSchema>,
  dictionnary: TransientComponentDictionnary,
) {
  const element = computed(() => {
    if (!id.value) {
      return null
    }
    return findElementById(component.value.template.elements, id.value)
  })

  const schema = computed(() => {
    if (element.value?.isComponent) {
      assertDefined(element.value.tag)
      return dictionnary[element.value.tag]
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

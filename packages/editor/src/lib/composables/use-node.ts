import type { TransientElement, TransientTemplate } from 'transient'
import { computed, type Ref } from 'vue'
import { assert, findElementById, getElementProps } from 'transient'
import { getElementId, getElementIr, type IrOpen } from '../ir/dom'

export function useNode(node: Ref<HTMLElement | null>, template: Ref<TransientTemplate>) {
  const ir = computed(() => {
    return node.value && getElementIr(node.value)
  })

  const element = computed(() => {
    if (!node.value) {
      return null
    }
    return getElementFromNode(node.value, template.value.elements)
  })

  return { node, element, ir }
}

export function getSlotName(ir: IrOpen) {
  assert(ir.type === 'slot')
  return ir.name!
}

export function getSlotOwnerId(ir: IrOpen) {
  assert(ir.type === 'slot')
  return ir.key
}

export function getElementFromNode(node: HTMLElement, elements: TransientElement[]) {
  const id = getElementId(node)

  if (id) {
    return findElementById(elements, id)
  }

  return null
}

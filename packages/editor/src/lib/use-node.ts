import type { TransientComponentSchema, TransientElement, TransientTemplate } from 'transient'
import { computed, readonly, ref, type ComputedRef, type Ref } from 'vue'
import { ComponentDictionnary } from './use-dictionnary'
import { assert, assertIsDefined, findElementById, getElementProps } from 'transient'
import {
  findAncestorIrTag,
  getElementId,
  getElementIr,
  getIrTagChildrenElements,
  parseOpenIrTag,
  traverseIrTree,
  type IrOpen,
} from './dom-ir'

export function useNode(
  node: Ref<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const ir = computed(() => {
    return node.value && getElementIr(node.value)
  })

  const editable = computed(() => {
    return node.value && (node.value.dataset.transientId || node.value.dataset.transientSlot)
  })

  const schema = computed(() => {
    if (ir.value?.type === 'component') {
      assertIsDefined(ir.value.name)
      return dictionnary.get(ir.value.name)
    }

    return null
  })

  const element = computed(() => {
    if (!node.value) {
      return null
    }
    return getElementFromNode(node.value, template.value.elements)
  })

  const isSlot = computed(() => {
    return ir.value?.type === 'slot'
  })

  const isEditableText = computed(() => {
    return node.value && node.value.contentEditable === 'true'
  })

  // const slotsNodes = computed(() => {
  //   if (!node.value) {
  //     return null
  //   }
  //   const id = getNodeId(node.value)
  //   if (!id) {
  //     return null
  //   }

  //   // if node is it's own slot
  //   if (isNodeASlotOf(id, node.value)) return [node.value]

  //   return node.value.querySelectorAll<HTMLElement>(`[data-transient-slot$='${id}']`)
  // })

  const props = computed(() => {
    if (!schema.value || !element.value) {
      return null
    }
    return getElementProps(schema.value, element.value)
  })

  return { node, element, editable, isSlot, isEditableText, schema, props }
}

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

export function useParentComponent(
  node: ComputedRef<HTMLElement | null>,
  template: Ref<TransientTemplate>,
  dictionnary: ComponentDictionnary,
) {
  const componentTag = computed<Node | null>(() => node.value && findAncestorIrTag(node.value))

  return useIrTag(componentTag, template, dictionnary)
}

export function getNodeId(node: HTMLElement) {
  return node.dataset.transientId
}

export function getNodeComponentTagName(node: HTMLElement) {
  return node.dataset.transientComponent
}

function isNodeComponent(node: HTMLElement) {
  return Boolean(getNodeComponentTagName(node))
}

export function isNodeEditable(node: HTMLElement) {
  return Boolean(node.dataset.transientId || node.dataset.transientSlot)
}

export function getSlotName(ir: IrOpen) {
  assert(ir.type === 'slot')
  return ir.name!
}

export function getSlotOwnerId(ir: IrOpen) {
  assert(ir.type === 'slot')
  return ir.key
}

// export function isNodeASlotOf(ownerTransientId: string, node: HTMLElement) {
//   const slotOwnerId = getSlotOwnerId(node)
//   if (!slotOwnerId) return false
//   return slotOwnerId === ownerTransientId
// }

export function getElementFromNode(node: HTMLElement, elements: TransientElement[]) {
  const id = getElementId(node)

  if (id) {
    return findElementById(elements, id)
  }

  return null
}

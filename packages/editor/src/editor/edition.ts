import type { TransientComponentSchema, TransientProp } from 'transient'
import {
  assertIsDefined,
  findElementById,
  htmlChildrenToTransientElements,
  htmlElementToTransientElement,
} from 'transient'
import {
  appendElement,
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElement,
  replaceElementSlot,
  updateElementProp,
} from 'transient'
import type { TransientElement } from 'transient'

export type Edition =
  | SlotEdition
  | UpdateElementEdition
  | AddComponentEdition
  | DeleteElementEdition
  | UpdateElementPropEdition

export type SlotEdition = {
  type: 'edit-slot'
  ownerId: string
  slotName: string
  node: HTMLElement
}

export type StartElementEdition = {
  type: 'start-element-edition'
  transientId: string
}

export type EndElementEdition = {
  type: 'end-element-edition'
  transientId: string
}

export type UpdateElementEdition = {
  type: 'update-element'
  transientId: string
  node: HTMLElement
}

export type AddComponentEdition = {
  type: 'add-component'
  position: 'after' | 'before' | 'append'
  targetId: string
  schema: TransientComponentSchema
}

export type DeleteElementEdition = {
  type: 'delete-element'
  transientId: string
}

export type UpdateElementPropEdition = {
  type: 'update-prop'
  prop: TransientProp
  propName: string
  value: unknown
  transientId: string
}

export type ComponentSlotEditionInput = Omit<SlotEdition, 'node'>
export type ElementEditionInput = Omit<UpdateElementEdition, 'node'>

export type EditionInput =
  | ComponentSlotEditionInput
  | ElementEditionInput
  | AddComponentEdition
  | DeleteElementEdition
  | UpdateElementPropEdition

export function applyEdition(edition: Edition, elements: TransientElement[]) {
  switch (edition.type) {
    case 'edit-slot': {
      const children = htmlChildrenToTransientElements(edition.node)
      replaceElementSlot(children, edition.slotName, edition.ownerId, elements)
      break
    }
    case 'update-element': {
      // todo put the smart comparison in replaceElement or a lower level function maybe.
      const preexistingElement = findElementById(elements, edition.transientId)
      const newElement = htmlElementToTransientElement(edition.node, edition.transientId)
      if (JSON.stringify(preexistingElement) === JSON.stringify(newElement)) {
        return
      }

      replaceElement(htmlElementToTransientElement(edition.node, edition.transientId), elements)
      break
    }

    case 'add-component': {
      const component: TransientElement = {
        tag: edition.schema.tag,
        isComponent: true,
        attributes: {},
        id: crypto.randomUUID(),
      }

      switch (edition.position) {
        case 'after': {
          insertAfterElement(component, edition.targetId, elements)
          break
        }
        case 'before': {
          insertBeforeElement(component, edition.targetId, elements)
          break
        }
        case 'append': {
          appendElement(component, edition.targetId, elements)
          break
        }
        default: {
          console.error('unknown add-component position')
        }
      }

      break
    }

    case 'delete-element': {
      removeElement(edition.transientId, elements)

      break
    }

    case 'update-prop': {
      updateElementProp(edition.propName, edition.value, edition.transientId, elements)

      break
    }

    default: {
      throw new Error(`unexpected edition ${JSON.stringify(edition)}`)
    }
  }
}

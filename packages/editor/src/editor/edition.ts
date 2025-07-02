import type { TransientComponentSchema } from 'transient/src/transient/definition'
import {
  htmlChildrenToTransientElements,
  htmlNodeToTransientElement,
} from 'transient/src/analyzers/html/html'
import {
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElement,
  replaceElementSlot,
} from 'transient/src/transient/ast'
import type { TransientElement } from 'transient/src/transient/definition'
import { assertIsDefined } from 'transient/src/core/assert'

export type Edition =
  | ComponentSlotEdition
  | ElementEdition
  | AddComponentEdition
  | DeleteElementEdition

export type ComponentSlotEdition = {
  type: 'component-slot'
  ownerId: string
  slotName: string
  node: HTMLElement
}

export type ElementEdition = {
  type: 'element'
  transientId: string
  node: HTMLElement
}

export type AddComponentEdition = {
  type: 'add-component'
  position: 'after' | 'before'
  targetId: string
  schema: TransientComponentSchema
}

export type DeleteElementEdition = {
  type: 'delete-element'
  transientId: string
}

export type ComponentSlotEditionInput = Omit<ComponentSlotEdition, 'node'>
export type ElementEditionInput = Omit<ElementEdition, 'node'>

export type EditionInput =
  | ComponentSlotEditionInput
  | ElementEditionInput
  | AddComponentEdition
  | DeleteElementEdition

export function applyEdition(edition: Edition, elements: TransientElement[]) {
  switch (edition.type) {
    case 'component-slot': {
      replaceElementSlot(
        htmlChildrenToTransientElements(edition.node),
        edition.slotName,
        edition.ownerId,
        elements,
      )
      break
    }
    case 'element': {
      replaceElement(htmlNodeToTransientElement(edition.node, edition.transientId), elements)
      break
    }

    case 'add-component': {
      const component: TransientElement = {
        tag: edition.schema.tag,
        isComponent: true,
        attributes: {},
        id: crypto.randomUUID(),
      }

      if (edition.position === 'after') {
        insertAfterElement(component, edition.targetId, elements)
      } else {
        insertBeforeElement(component, edition.targetId, elements)
      }
      break
    }

    case 'delete-element': {
      removeElement(edition.transientId, elements)
    }

    default: {
      throw new Error('unexpected edition')
    }
  }
}

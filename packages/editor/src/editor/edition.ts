import type { TransientComponentSchema } from 'transient/src/transient/definition'
import {
  htmlChildrenToTransientElements,
  htmlElementToTransientElement,
} from 'transient/src/analyzers/html/html'
import {
  appendElement,
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElement,
  replaceElementSlot,
} from 'transient/src/transient/ast'
import type { TransientElement } from 'transient/src/transient/definition'

export type Edition =
  | SlotEdition
  | ElementEdition
  | AddComponentEdition
  | AppendComponentEdition
  | DeleteElementEdition

export type SlotEdition = {
  type: 'edit-slot'
  ownerId: string
  slotName: string
  node: HTMLElement
}

export type ElementEdition = {
  type: 'edit-element'
  transientId: string
  node: HTMLElement
}

export type AddComponentEdition = {
  type: 'add-component'
  position: 'after' | 'before'
  targetId: string
  schema: TransientComponentSchema
}

export type AppendComponentEdition = {
  type: 'append-component'
  targetId: string
  schema: TransientComponentSchema
}

export type DeleteElementEdition = {
  type: 'delete-element'
  transientId: string
}

export type ComponentSlotEditionInput = Omit<SlotEdition, 'node'>
export type ElementEditionInput = Omit<ElementEdition, 'node'>

export type EditionInput =
  | ComponentSlotEditionInput
  | ElementEditionInput
  | AddComponentEdition
  | DeleteElementEdition
  | AppendComponentEdition

export function applyEdition(edition: Edition, elements: TransientElement[]) {
  console.log({ edition })

  switch (edition.type) {
    case 'edit-slot': {
      const children = htmlChildrenToTransientElements(edition.node)
      replaceElementSlot(children, edition.slotName, edition.ownerId, elements)
      break
    }
    case 'edit-element': {
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

      if (edition.position === 'after') {
        insertAfterElement(component, edition.targetId, elements)
      } else {
        insertBeforeElement(component, edition.targetId, elements)
      }
      break
    }

    case 'append-component': {
      const component: TransientElement = {
        tag: edition.schema.tag,
        isComponent: true,
        attributes: {},
        id: crypto.randomUUID(),
      }

      appendElement(component, edition.targetId, elements)

      break
    }

    case 'delete-element': {
      removeElement(edition.transientId, elements)

      break
    }

    default: {
      throw new Error(`unexpected edition ${JSON.stringify(edition)}`)
    }
  }
}

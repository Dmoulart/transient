import type { TransientComponentSchema, TransientElement, TransientProp } from '@transient/ir'
import {
  appendElement,
  insertAfterElement,
  insertBeforeElement,
  removeElement,
  replaceElementSlot,
  updateElementProp,
} from '@transient/ir'

export type Edition =
  | AddComponentEdition
  | DeleteElementEdition
  | UpdateElementPropEdition
  | ReplaceSlotContentEdition

export type ReplaceSlotContentEdition = {
  type: 'replace-slot-content'
  id: string
  slotName: string
  content: TransientElement[]
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

export type EditionInput = AddComponentEdition | DeleteElementEdition | UpdateElementPropEdition

export function applyEdition(edition: Edition, elements: TransientElement[]) {
  switch (edition.type) {
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

    case 'replace-slot-content': {
      replaceElementSlot(edition.content, edition.slotName, edition.id, elements)

      break
    }

    default: {
      throw new Error(`unexpected edition ${JSON.stringify(edition)}`)
    }
  }
}

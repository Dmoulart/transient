import type { BindingValue, TransientElement, TransientProp } from '@transient/ir'
import {
  appendElement,
  insertAfterElement,
  insertBeforeElement,
  moveElement,
  removeElement,
  replaceElementSlot,
  updateElementProp,
} from '@transient/ir'

export type Edition =
  | AddElementEdition
  | DeleteElementEdition
  | UpdateElementPropEdition
  | MoveElementEdition
  | ReplaceSlotContentEdition

export type AddElementEdition = {
  type: 'add-component'
  position: 'after' | 'before' | 'append'
  targetId: string
  element: TransientElement
}

export type DeleteElementEdition = {
  type: 'delete-element'
  transientId: string
}

export type UpdateElementPropEdition = {
  type: 'update-prop'
  prop: TransientProp
  propName: string
  value: BindingValue
  transientId: string
}

export type ReplaceSlotContentEdition = {
  type: 'replace-slot-content'
  id: string
  slotName: string
  content: TransientElement[]
}

export type MoveElementEdition = {
  type: 'move-element'
  id: string
  direction: 'up' | 'down'
}

export function applyEdition(edition: Edition, elements: TransientElement[]) {
  switch (edition.type) {
    case 'add-component': {
      switch (edition.position) {
        case 'after': {
          insertAfterElement(edition.element, edition.targetId, elements)
          break
        }
        case 'before': {
          insertBeforeElement(edition.element, edition.targetId, elements)
          break
        }
        case 'append': {
          appendElement(edition.element, edition.targetId, elements)
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

    case 'move-element': {
      moveElement(edition.id, edition.direction, elements)

      break
    }

    default: {
      throw new Error(`unexpected edition ${JSON.stringify(edition)}`)
    }
  }
}

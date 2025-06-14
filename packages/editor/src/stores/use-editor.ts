import type { TransientElement } from 'transient/src/transient/definition'

export function findElementById(
  elements: TransientElement[],
  id: number,
): TransientElement | undefined {
  for (const element of elements) {
    if (element.id === id) return element

    if (element.slots) {
      for (const slotElements of Object.values(element.slots)) {
        const found = findElementById(slotElements, id)
        if (found) return found
      }
    }
  }
  return undefined
}

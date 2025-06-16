import {
  getComponentDefaultPropsValues,
  type TransientComponentDictionnary,
} from 'transient/src/transient'
import { computed, ref } from 'vue'
import { registry, useRegistry } from './use-dictionnary'

export type PrototypeSlot<T extends 'unique' | 'list'> = { type: T; prototype: Prototype }

export type PrototypeSlots = Record<string, PrototypeSlot<any>[]>

export type Prototype = {
  id: number
  path: string
  slots: PrototypeSlots
  data: Record<string, any>
}

export const rootPrototype = ref<Prototype | undefined>()
export const selectedPrototype = ref<Prototype | undefined>()
export const prototypeSlotEdition = ref<{ prototype: Prototype; slot: string } | undefined>()

export function useRootPrototype() {
  return rootPrototype
}

export function useSelectedPrototype() {
  return selectedPrototype
}

export function usePrototypeSlotEdition() {
  return {
    start(prototype: Prototype, slot: string) {
      prototypeSlotEdition.value = { prototype, slot }
    },
    stop() {
      prototypeSlotEdition.value = undefined
    },
    slot: computed(() => prototypeSlotEdition.value?.slot),
    prototype: computed(() => prototypeSlotEdition.value?.prototype),
  }
}

export function useSchema(prototype = useSelectedPrototype()) {
  return computed(() => {
    if (!prototype.value) {
      return undefined
    }

    return getSchema(prototype.value)
  })
}

export function getSchema(prototype: Prototype) {
  return registry.value[prototype.path]
}

export function getSchemaSlots(prototype: Prototype) {
  return registry.value[prototype.path]?.slots
}

export function hasSchemaSlots(prototype: Prototype) {
  return (
    registry.value[prototype.path]?.slots &&
    Object.keys(registry.value[prototype.path].slots).length > 0
  )
}

export function getPrototypeName(path: string) {
  return path.split('/').at(-1)
}

let id = 0
export function createPrototype(path: string): Prototype {
  const dictionnary = useRegistry()

  if (!dictionnary.value[path]) {
    throw new Error(`Unknown component ${path}`)
  }

  return {
    id: ++id,
    path,
    data: getComponentDefaultPropsValues(dictionnary.value[path].props),
    slots: {},
  }
}

type ParentSearchResult = {
  parent: Prototype | null
  slotKey: string | null
  pathToParent: Prototype[]
}

/**
 * Recursively finds the parent of the node with `childId`
 */
export function findParentByChildId(
  current: Prototype,
  childId: number,
  path: Prototype[] = [],
): ParentSearchResult | null {
  for (const [slotKey, slotItems] of Object.entries(current.slots)) {
    for (const slot of slotItems) {
      const child = slot.prototype

      if (child.id === childId) {
        return {
          parent: current,
          slotKey,
          pathToParent: path,
        }
      }

      const result = findParentByChildId(child, childId, [...path, current])
      if (result) return result
    }
  }

  return null
}

export function findParent(prototype: Prototype) {
  const rootPrototype = useRootPrototype().value

  if (!rootPrototype) {
    return false
  }

  return findParentByChildId(rootPrototype, prototype.id)
}

export function hasParent(prototype: Prototype) {
  return Boolean(findParent(prototype))
}

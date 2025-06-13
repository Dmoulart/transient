import {
  getComponentDefaultPropsValues,
  type TransientComponentDictionnary,
} from 'transient/src/transient'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useTransient } from './use-transient'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type PrototypeSlot<T extends 'unique' | 'list'> = { type: T; prototype: Prototype }

export type PrototypeSlots = Record<string, PrototypeSlot<any>[]>

export type Prototype = {
  id: number
  path: string
  slots: PrototypeSlots
  data: Record<string, any>
}

export const dictionnary = ref<TransientComponentDictionnary>({})
export const rootPrototype = ref<Prototype | undefined>()
export const selectedPrototype = ref<Prototype | undefined>()
export const prototypeSlotEdition = ref<{ prototype: Prototype; slot: string } | undefined>()

export async function loadDictionnary() {
  try {
    const response = await fetch('http://127.0.0.1:3001/schemas')
    await response.json()
  } catch (error) {
    console.error(error)
  }
}

// Crée un résolveur global de composants
const componentModules = import.meta.glob('@/samples/**/*.vue')

export async function loadAllComponents(): Promise<Record<string, any>> {
  const result: Record<string, any> = {}

  for (const path in componentModules) {
    const name = path.split('/').pop()?.replace('.vue', '')
    if (name) {
      const mod = await componentModules[path]()
      result[name] = mod.default
    }
  }

  return result
}

export function useDictionnary() {
  return dictionnary
}

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
  return dictionnary.value[prototype.path]
}

export function getSchemaSlots(prototype: Prototype) {
  return dictionnary.value[prototype.path]?.slots
}

export function hasSchemaSlots(prototype: Prototype) {
  return (
    dictionnary.value[prototype.path]?.slots &&
    Object.keys(dictionnary.value[prototype.path].slots).length > 0
  )
}

export function getPrototypeName(path: string) {
  return path.split('/').at(-1)
}

let id = 0
export function createPrototype(path: string): Prototype {
  const dictionnary = useDictionnary()

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

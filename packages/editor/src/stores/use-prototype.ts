import type { TransientComponentSchema } from 'transient'
import {
  getComponentDefaultPropsValues,
  type TransientComponentDictionnary,
} from 'transient/src/transient'
import { computed, inject, provide, ref, unref, type Ref } from 'vue'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

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
export const editedPrototype = ref<Prototype | undefined>()
export const prototypeSlotEdition = ref<{ prototype: Prototype; slot: string } | undefined>()

export function useDictionnary() {
  return dictionnary
}

export function usePrototype() {
  return editedPrototype
}

export function usePrototypeSlotEdition() {
  return {
    edit(prototype: Prototype, slot: string) {
      prototypeSlotEdition.value = { prototype, slot }
    },
    quit() {
      prototypeSlotEdition.value = undefined
    },
    slot: computed(() => prototypeSlotEdition.value?.slot),
    prototype: computed(() => prototypeSlotEdition.value?.prototype),
  }
}

export function useSchema(prototype = usePrototype()) {
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

import { defineStore } from 'pinia'
import type { TransientComponentSchema } from 'transient'
import { inject, provide, ref } from 'vue'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type PrototypeSlot<T extends 'unique' | 'list'> = { type: T; prototype: Prototype }

export type PrototypeSlots = Record<string, PrototypeSlot<any>[]>

export type Prototype = {
  path: string
  schema: TransientComponentSchema
  slots: PrototypeSlots
  data: Record<string, any>
}

export const usePrototypes = defineStore('prototype', () => {
  const root = ref<PartialBy<Prototype, 'path'>>({
    path: undefined,
    schema: {
      props: {},
      slots: {},
    },
    data: {},
    slots: {},
  })

  return { root }
})

export function usePrototype() {
  return inject<Prototype>('prototype')
}

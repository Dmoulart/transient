import { defineStore } from 'pinia'
import type { TransientComponentSchema } from 'transient'
import { inject, provide, ref, type Ref } from 'vue'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type PrototypeSlot<T extends 'unique' | 'list'> = { type: T; prototype: Prototype }

export type PrototypeSlots = Record<string, PrototypeSlot<any>[]>

export type Prototype = {
  path: string
  slots: PrototypeSlots
  data: Record<string, any>
}

export const rootPrototype = ref<Prototype | undefined>()

export function providePrototype(prototype: Ref<Prototype | undefined>) {
  return provide('edited-prototype', prototype)
}

export function usePrototype(): Ref<Prototype> {
  return inject<Ref<Prototype>>('edited-prototype') as Ref<Prototype>
}

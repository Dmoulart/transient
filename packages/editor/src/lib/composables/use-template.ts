import type { TransientTemplate } from '@transient/ir'
import { type ComputedRef, inject, provide } from 'vue'

const templateInjectionKey = Symbol('templateInjectionKey')
export function provideTemplate(schema: ComputedRef<TransientTemplate>) {
  provide<ComputedRef>(templateInjectionKey, schema)
}
export function useTemplate(): ComputedRef<TransientTemplate> {
  const template = inject<ComputedRef<TransientTemplate>>(templateInjectionKey)
  if (!template) {
    throw new Error('Expected template to be provided by ComponentEditor')
  }
  return template
}

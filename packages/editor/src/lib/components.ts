import type { TransientComponentSchema } from '@transient/ir'
import type { Component } from 'vue'

export type ResolveComponent = (
  tag: string,
  schema: TransientComponentSchema | undefined,
) => Component | null | undefined

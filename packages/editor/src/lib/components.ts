import type { TransientComponentSchema } from '@transient/ir'
import type { Component } from 'vue'

// return undefined to fall back on the components registered on the Vue app
export type ResolveComponent = (
  tag: string,
  schema: TransientComponentSchema,
) => Component | undefined

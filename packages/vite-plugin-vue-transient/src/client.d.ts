declare module 'virtual:transient/components' {
  import type { Component } from 'vue'

  const components: Record<string, Component>
  export default components
}

declare module 'virtual:transient/schemas' {
  import type { TransientComponentDictionnary } from '@transient/ir'

  const schemas: TransientComponentDictionnary
  export default schemas
}

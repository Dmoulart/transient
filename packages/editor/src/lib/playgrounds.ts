import components from 'virtual:transient/components'
import type { ResolveComponent } from './components'

export const resolveComponent: ResolveComponent = (tag) => components[tag]!

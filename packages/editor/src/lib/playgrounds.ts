import type { Component } from 'vue'
import type { ResolveComponent } from './components'

const modules = import.meta.glob<Component>(['@/samples/**/*.vue', '@/tests/**/*.vue'], {
  eager: true,
  import: 'default',
})

// the tag is the file name: samples/Button.vue → Button
const components = Object.fromEntries(
  Object.entries(modules).map(([path, component]) => [
    path.split('/').pop()!.replace('.vue', ''),
    component,
  ]),
)

export const resolveComponent: ResolveComponent = (tag) => components[tag]!

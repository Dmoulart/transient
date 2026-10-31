import { fileURLToPath } from 'node:url'
import { addVitePlugin, defineNuxtModule, extendRouteRules } from '@nuxt/kit'
import type { Component, NuxtPage } from '@nuxt/schema'
import transient from '@transient/vite-plugin-vue-transient'

export type ModuleOptions = {
  route: string
}

const runtimeDir = fileURLToPath(new URL('../runtime', import.meta.url))

// Nuxt's own registry is the single source of truth: project, module and
// built-in components (NuxtLink, NuxtImg…) all come from `components:extend`.
export default defineNuxtModule<ModuleOptions>({
  meta: { name: '@transient/nuxt', configKey: 'transient' },
  defaults: { route: '/__transient' },
  setup(options, nuxt) {
    let components: Component[] = []
    let pages: NuxtPage[] = []

    nuxt.hook('components:extend', (registry) => {
      // server components and islands can't be rendered client side
      components = registry.filter((c) => c.mode !== 'server' && !c.island)
    })
    nuxt.hook('pages:extend', (routes) => {
      pages = flatten(routes).filter((page) => page.file)
    })

    addVitePlugin(
      transient({
        getComponentEntries() {
          return [
            ...components.map(({ pascalName, filePath, export: exportName }) => ({
              name: pascalName,
              filePath: filePath,
              exportName,
            })),
            ...pages.map(({ name, file }) => ({ name: name ?? file!, filePath: file! })),
          ]
        },
      }),
    )

    // the editor is browser-only (pointer events, caret APIs)
    extendRouteRules(options.route, { ssr: false, prerender: false })
    // editor.js imports its CSS: let Vite handle it instead of Node on the server
    nuxt.options.build.transpile.push(runtimeDir, '@transient/nuxt')
  },
})

function flatten(routes: NuxtPage[]): NuxtPage[] {
  return routes.flatMap((route) => [route, ...flatten(route.children ?? [])])
}

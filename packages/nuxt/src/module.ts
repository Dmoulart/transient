import { fileURLToPath } from 'node:url'
import {
  addTemplate,
  addVitePlugin,
  defineNuxtModule,
  extendPages,
  extendRouteRules,
  updateTemplates,
  useLogger,
} from '@nuxt/kit'
import type { Component, NuxtPage } from '@nuxt/schema'
import { type ComponentEntry, describeVueComponents } from '@transient/analyzer-vue'
import transient from '@transient/vite-plugin-vue-transient'

export type ModuleOptions = {
  route: string
}

const runtimeDir = fileURLToPath(new URL('../runtime', import.meta.url))
const editorPage = `${runtimeDir}/editor.vue`
const logger = useLogger('transient')

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
      pages = flatten(routes).filter((page) => page.file && page.file !== editorPage)
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
    addTemplate({
      filename: 'transient/components.mjs',
      // eager: an async wrapper would sit between the editor and the real instance
      getContents: () =>
        [
          ...components.map(
            (c, i) => `import { ${c.export} as c${i} } from ${JSON.stringify(c.filePath)}`,
          ),
          `export default { ${components.map((c, i) => `${JSON.stringify(c.pascalName)}: c${i}`).join(', ')} }`,
        ].join('\n'),
    })

    const schemas = addTemplate({
      filename: 'transient/schemas.mjs',
      getContents: () => {
        const entries: ComponentEntry[] = [
          ...components.map((c) => ({
            name: c.pascalName,
            filePath: c.filePath,
            exportName: c.export,
          })),
          ...pages.map((p) => ({ name: p.name ?? p.file!, filePath: p.file! })),
        ]
        try {
          const dictionnary = describeVueComponents(
            entries,
            `${nuxt.options.rootDir}/tsconfig.json`,
          )
          return `export default ${JSON.stringify(dictionnary)}`
        } catch (e) {
          logger.error('analysis failed', e)
          return `export default {} // ${String(e).replaceAll('\n', ' ')}`
        }
      },
    })

    // ponytail: any .vue change re-analyzes everything, per-file cache if it gets slow
    nuxt.hook('builder:watch', async (_event, path) => {
      if (path.endsWith('.vue')) {
        await updateTemplates({ filter: (t) => t.filename === schemas.filename })
      }
    })

    extendPages((routes) => {
      routes.push({ name: 'transient-editor', path: options.route, file: editorPage })
    })
    // the editor is browser-only (pointer events, caret APIs)
    extendRouteRules(options.route, { ssr: false, prerender: false })
    nuxt.options.build.transpile.push(runtimeDir)
  },
})

function flatten(routes: NuxtPage[]): NuxtPage[] {
  return routes.flatMap((route) => [route, ...flatten(route.children ?? [])])
}

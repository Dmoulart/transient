import { globSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { type ComponentEntry, describeVueComponents } from '@transient/analyzer-vue'
import { pascalCase } from '@transient/core'
import ts from 'typescript'
import type { Plugin, ResolvedConfig } from 'vite'
export type TransientVitePluginOptions = {
  componentsPaths?: string | string[]
  getComponentEntries?: () => Promise<ComponentEntry[]>
  tsConfigPath?: string
}
export default function transient(options: TransientVitePluginOptions): Plugin {
  let config: ResolvedConfig
  let tsConfigPath: string

  async function getComponentEntries(): Promise<ComponentEntry[]> {
    if (options.getComponentEntries) {
      return options.getComponentEntries()
    }

    if (options.componentsPaths) {
      const paths = Array.isArray(options.componentsPaths)
        ? options.componentsPaths
        : [options.componentsPaths]

      const files = globSync(paths.map((path) => resolve(config.root, path)))

      const componentNames = new Set()
      return files.map((filePath) => {
        const name = pascalCase(basename(filePath, '.vue'))
        if (componentNames.has(name)) {
          console.warn(`Duplicate component ${name}. The last one will prevail.`)
        }
        componentNames.add(name)
        return {
          filePath,
          name,
        }
      })
    }

    throw new Error('Expected componentPaths or getComponentEntries to be defined')
  }

  return {
    name: 'vite-plugin-vue-transient',
    resolveId(id) {
      if (id.startsWith('virtual:transient')) {
        const [base, subpath] = id.split('/')
        if (subpath === 'schemas' || subpath === 'components') {
          return `\0${base}/${subpath}`
        }
      }
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    configureServer(server) {
      server.watcher.on('all', (event, file) => {
        if (!file.endsWith('.vue')) return
        const ids = ['\0virtual:transient/schemas']
        if (event === 'add' || event === 'unlink') {
          ids.push('\0virtual:transient/components')
        }
        for (const id of ids) {
          const module = server.moduleGraph.getModuleById(id)
          if (module) {
            server.reloadModule(module)
          }
        }
      })
    },
    buildStart() {
      const maybeTsConfigPath =
        options.tsConfigPath ?? ts.findConfigFile(config.root, ts.sys.fileExists)
      if (!maybeTsConfigPath) {
        throw new Error('Cannot find tsconfig path')
      }
      tsConfigPath = maybeTsConfigPath
    },

    async load(id) {
      if (id.startsWith('\0virtual:transient')) {
        const [, subpath] = id.split('/')
        if (subpath === 'schemas') {
          const entries = await getComponentEntries()
          const dictionnary = describeVueComponents(entries, tsConfigPath)
          return `export default ${JSON.stringify(dictionnary)}`
        }

        if (subpath === 'components') {
          const entries = await getComponentEntries()
          return [
            ...entries.map(
              (e, i) =>
                `import { ${e.exportName ?? 'default'} as c${i} } from ${JSON.stringify(e.filePath)}`,
            ),
            `export default { ${entries.map((e, i) => `${JSON.stringify(e.name)}: c${i}`).join(', ')} }`,
          ].join('\n')
        }
      }
    },
  }
}

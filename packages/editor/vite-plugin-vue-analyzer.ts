import { resolve } from 'node:path'
import { defineVueAnalyzer, type VueAnalyzerOptions } from 'transient/server'
import type { Plugin } from 'vite'

function generateSchemas(options: VueAnalyzerOptions) {
  console.log('Génération des schémas des components Vue…')

  const analyze = defineVueAnalyzer(options)

  analyze({
    dir: resolve(process.cwd(), '.'),
  })

  console.log('Schémas générés avec succès.')
}

export default function vueAnalyzerPlugin(options: VueAnalyzerOptions): Plugin {
  return {
    name: 'vite-plugin-vue-analyzer',
    apply: 'serve',
    buildStart() {
      generateSchemas(options)
    },
    handleHotUpdate(context) {
      // Filtrer les fichiers .vue
      if (context.file.endsWith('.vue')) {
        generateSchemas(options)
      }
      return [] // pas de modules invalidés
    },
  }
}

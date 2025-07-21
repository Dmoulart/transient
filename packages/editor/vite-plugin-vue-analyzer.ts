import { Plugin } from 'vite'
import { resolve } from 'path'
import { defineVueAnalyzer } from 'transient'
import { writeFileSync } from 'fs'
import { VueAnalyzerOptions } from 'transient'

function generateSchemas(options: VueAnalyzerOptions) {
  console.log('Génération des schémas des components Vue…')

  const analyzer = defineVueAnalyzer(options)
  const schemas = analyzer({
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

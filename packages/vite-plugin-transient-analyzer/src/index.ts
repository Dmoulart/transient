import { resolve } from 'node:path'
import { defineVueAnalyzer, type VueAnalyzerOptions } from '@transient/analyzer-vue'
import type { Plugin } from 'vite'

function generateSchemas(options: VueAnalyzerOptions) {
  console.info('Generating schemas')

  const analyze = defineVueAnalyzer(options)

  analyze({
    dir: resolve(process.cwd(), '.'),
  })

  console.info('Schemas generated')
}

export default function vueAnalyzerPlugin(options: VueAnalyzerOptions): Plugin {
  return {
    name: 'vite-plugin-transient-analyzer',
    apply: 'serve',
    buildStart() {
      generateSchemas(options)
    },
    handleHotUpdate(context) {
      if (context.file.endsWith('.vue')) {
        generateSchemas(options)
      }
      return []
    },
  }
}

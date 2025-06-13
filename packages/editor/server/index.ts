import { serve } from 'bun'
import { resolve } from 'url'
import { defineVueAnalyzer } from '../../transient/src/index'
import { writeFileSync } from 'fs'
serve({
  port: 3001,
  routes: {
    '/schemas': () => {
      const analyzer = defineVueAnalyzer({
        tsConfigPath: resolve(__dirname, './tsconfig.app.json'),
        glob: resolve(__dirname, './src/samples/**/*.vue'),
      })

      const schemas = analyzer({
        dir: resolve(__dirname, '.'),
      })
      writeFileSync('schemas.json', JSON.stringify(schemas))
      return new Response(JSON.stringify(schemas), {
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      })
    },
  },
})

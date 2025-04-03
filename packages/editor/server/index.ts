import { serve } from 'bun'
import { resolve } from 'url'
import { defineVueAnalyzer } from 'transient'

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

      return new Response(JSON.stringify(schemas), {
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5173',
        },
      })
    },
  },
})
